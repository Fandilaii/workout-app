/* =============================================
   FitPulse Cloud Functions
   AI Set Scanner — Claude Vision Proxy
   ============================================= */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();
const db = admin.firestore();

// Secret Manager reference — set via: firebase functions:secrets:set ANTHROPIC_API_KEY
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

// Config
const PRIMARY_MODEL = "claude-haiku-4-5";
const FALLBACK_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 512;
const CACHE_TTL_MS = 90 * 60 * 1000; // 90 minutes
const MAX_IMAGE_BYTES = 200 * 1024;   // 200KB decoded

const SYSTEM_PROMPT = `You are a gym exercise identification assistant. Given two images:
- Image 1: person performing an exercise
- Image 2: the weight indicator (stack pin, dumbbell label, barbell plates)

Return ONLY valid JSON — no markdown fences, no extra text:
{
  "exercise": "<standard gym exercise name>",
  "weight_kg": <number, 0 if unreadable>,
  "unit": "kg" | "lbs",
  "confidence": <0.0-1.0>,
  "notes": "<optional edge case note>"
}
If exercise unidentifiable: set exercise "" and confidence 0.`;

// =============================================
//   identifyWorkoutSet — Callable Function
// =============================================

exports.identifyWorkoutSet = onCall(
  { secrets: [anthropicApiKey], timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    // 1. Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to use the scanner.");
    }
    const uid = request.auth.uid;

    // 2. Validate inputs
    const { photo1, photo2, hash } = request.data;
    if (!photo1 || !photo2) {
      throw new HttpsError("invalid-argument", "Two photos are required.");
    }

    // Check decoded sizes
    const size1 = Buffer.byteLength(photo1, "base64");
    const size2 = Buffer.byteLength(photo2, "base64");
    if (size1 > MAX_IMAGE_BYTES || size2 > MAX_IMAGE_BYTES) {
      throw new HttpsError("invalid-argument", "Images must be under 200KB each.");
    }

    // 3. Check Firestore scan cache
    if (hash) {
      const cacheRef = db.collection("users").doc(uid).collection("scanCache").doc(hash);
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cached = cacheDoc.data();
        if (cached.expiresAt && cached.expiresAt.toDate() > new Date()) {
          // Cache hit — increment counter and return
          await cacheRef.update({ hitCount: admin.firestore.FieldValue.increment(1) });
          return {
            exercise: cached.exercise,
            weight_kg: cached.weight_kg,
            unit: cached.unit || "kg",
            confidence: cached.confidence,
            notes: cached.notes || "",
            model: cached.model,
            cached: true,
          };
        }
      }
    }

    // 4. Build Claude message content
    const imageContent = [
      {
        type: "image",
        source: { type: "base64", media_type: "image/webp", data: photo1 },
      },
      { type: "text", text: "Image 1: Exercise position" },
      {
        type: "image",
        source: { type: "base64", media_type: "image/webp", data: photo2 },
      },
      { type: "text", text: "Image 2: Weight indicator" },
    ];

    // 5. Call Claude
    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    let result = await callClaude(client, PRIMARY_MODEL, imageContent);

    // 6. Fallback to Sonnet if parse failed
    if (!result) {
      console.warn("Haiku parse failed, falling back to Sonnet");
      result = await callClaude(client, FALLBACK_MODEL, imageContent);
    }

    // 7. Total failure
    if (!result) {
      return { exercise: "", weight_kg: 0, unit: "kg", confidence: 0, notes: "", model: "none", error: "scan_failed" };
    }

    // 8. Cache successful results
    if (hash && result.confidence >= 0.50) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);
      await db.collection("users").doc(uid).collection("scanCache").doc(hash).set({
        imageHash: hash,
        exercise: result.exercise,
        weight_kg: result.weight_kg,
        unit: result.unit || "kg",
        confidence: result.confidence,
        notes: result.notes || "",
        model: result.model,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        hitCount: 0,
      });
    }

    // 9. Track cost
    const today = new Date().toISOString().split("T")[0];
    const costRef = db.collection("admin").doc("costTracking").collection("daily").doc(today);
    await costRef.set({
      scanCount: admin.firestore.FieldValue.increment(1),
      fallbackCount: admin.firestore.FieldValue.increment(result.model === FALLBACK_MODEL ? 1 : 0),
    }, { merge: true });

    return result;
  }
);

// =============================================
//   callClaude — Helper
// =============================================

async function callClaude(client, model, imageContent) {
  try {
    const response = await client.messages.create({
      model: model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: imageContent }],
    });

    const text = response.content[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.exercise !== "string" || typeof parsed.confidence !== "number") {
      return null;
    }

    return {
      exercise: parsed.exercise,
      weight_kg: Number(parsed.weight_kg) || 0,
      unit: parsed.unit === "lbs" ? "lbs" : "kg",
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      notes: String(parsed.notes || ""),
      model: model,
    };
  } catch (err) {
    console.error(`Claude ${model} error:`, err.message);
    return null;
  }
}

// =============================================
//   cleanupScanCache — Scheduled (daily 3 AM UTC)
// =============================================

exports.cleanupScanCache = onSchedule("every day 03:00", async () => {
  const usersSnapshot = await db.collection("users").get();
  let deletedCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const cacheSnapshot = await userDoc.ref
      .collection("scanCache")
      .where("expiresAt", "<", admin.firestore.Timestamp.now())
      .get();

    const batch = db.batch();
    cacheSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    if (cacheSnapshot.size > 0) {
      await batch.commit();
      deletedCount += cacheSnapshot.size;
    }
  }

  console.log(`Cleaned up ${deletedCount} expired scan cache entries`);
});
