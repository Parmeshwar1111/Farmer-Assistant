// src/lib/sarvam.js
// Small helper wrapper for Sarvam.ai REST endpoints (STT + TTS).
// Requires Vite env var: VITE_SARVAM_KEY

const SARVAM_KEY = import.meta.env.VITE_SARVAM_KEY;

if (!SARVAM_KEY) {
  console.warn("VITE_SARVAM_KEY is not set. Add it to your .env");
}

/**
 * Send audio Blob to Sarvam STT endpoint.
 * Returns: { transcript: string, language_code: string }
 */
export async function sarvamSpeechToText(audioBlob, { model = "saarika:v2.5" } = {}) {
  const url = "https://api.sarvam.ai/speech-to-text";
  const form = new FormData();
  form.append("file", audioBlob, "speech.webm");
  form.append("model", model); // optional

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_KEY,
      // Do NOT set Content-Type for multipart/form-data (browser will set boundary).
    },
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Sarvam STT error ${res.status}: ${txt}`);
  }

  const j = await res.json();
  // Example response fields: transcript, language_code
  return {
    transcript: j.transcript ?? "",
    language_code: j.language_code ?? "hi-IN",
  };
}

/**
 * Convert text -> speech via Sarvam TTS.
 * Returns an HTMLAudioElement (already playing).
 * Sarvam returns base64 wave strings in `audios` array.
 */
export async function sarvamTextToSpeech(text, target_language_code = "hi-IN", opts = {}) {
  const url = "https://api.sarvam.ai/text-to-speech";
  const body = {
    text,
    target_language_code, // e.g. "mr-IN", "hi-IN", "en-US"
    model: opts.model ?? "bulbul:v2",
    speaker: opts.speaker ?? "anushka",
    // optional: pitch, pace, loudness, speech_sample_rate, etc.
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": SARVAM_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Sarvam TTS error ${res.status}: ${txt}`);
  }

  const j = await res.json();
  const base64 = j.audios?.[0];
  if (!base64) throw new Error("No audio returned from Sarvam TTS");

  // convert base64 -> Blob
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  const audioBlob = new Blob([bytes.buffer], { type: "audio/wav" });

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play().catch((e) => {
    console.warn("Autoplay failed:", e);
  });
  return audio;
}
