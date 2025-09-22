// src/contexts/DataContext.jsx
import React, { createContext, useState, useCallback } from "react";
import { sarvamSpeechToText, sarvamTextToSpeech } from "../lib/sarvam";
import runGemini from "../lib/gemini";

// eslint-disable-next-line react-refresh/only-export-components
export const DataContext = createContext();

export function DataProvider({ children }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState(""); // e.g. "mr-IN"
  const [aiReply, setAiReply] = useState("");
  const [busy, setBusy] = useState(false);

  // Record audio for `durationMs` (default 6s). Returns Blob.
  const recordAudio = (durationMs = 6000) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        setRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        const chunks = [];
        mr.ondataavailable = (e) => chunks.push(e.data);
        mr.start();

        setTimeout(() => {
          try {
            mr.stop();
          // eslint-disable-next-line no-empty
          } catch { }
        }, durationMs);

        mr.onstop = () => {
          setRecording(false);
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: "audio/webm" });
          resolve(blob);
        };
      } catch (err) {
        setRecording(false);
        reject(err);
      }
    });

  // top-level flow: record -> STT -> Gemini -> TTS
  const startConversation = useCallback(
    async (opts = { recordMs: 6000 }) => {
      setBusy(true);
      setAiReply("");
      try {
        // 1) Record
        const audioBlob = await recordAudio(opts.recordMs);

        // 2) STT (Sarvam) -> get transcript + language_code
        const { transcript: txt, language_code } = await sarvamSpeechToText(audioBlob);
        setTranscript(txt);
        setLanguage(language_code || "hi-IN");

        if (!txt) {
          setBusy(false);
          return;
        }

        // 3) Send to Gemini (pass language)
        // Use the short language (mr-IN -> mr) in the system instruction in gemini.js
        const geminiReply = await runGemini(txt, language_code || "hi-IN");
        setAiReply(geminiReply);

        // 4) TTS via Sarvam
        // Sarvam TTS expects BCP-47 target_language_code (e.g., "mr-IN")
        await sarvamTextToSpeech(geminiReply, language_code || "hi-IN", { speaker: "anushka" });
      } catch (err) {
        console.error("Conversation error:", err);
        alert(err.message || "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // quick fallback speak using browser TTS (if Sarvam TTS fails)
  const speakFallback = (text, langCode = "hi-IN") => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langCode;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("Fallback TTS failed:", e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        recording,
        transcript,
        language,
        aiReply,
        busy,
        startConversation,
        speakFallback,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
