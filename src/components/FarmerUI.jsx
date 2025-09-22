// src/components/FarmerUI.jsx
import React from "react";
import "./FarmerUI.css";
import assistantImg from "../assets/img/a--2.gif"; // small assistant avatar

export default function FarmerUI({ transcript, aiReply, language, recording, busy, startConversation }) {
  return (
    <div className="farmer-bg">
      <div className="assistant-card">
        <img src={assistantImg} alt="Assistant" className="assistant-img" />
        <h1>🌾 Farmer Assistant</h1>
        <p className="subtitle">Speaks back in the same language you speak (Marathi/Hindi/English...)</p>

        <div className="buttons">
          <button
            onClick={() => startConversation({ recordMs: 6000 })}
            disabled={recording || busy}
            className={`btn ${recording || busy ? "btn-disabled" : "btn-primary"}`}
          >
            {recording ? "Listening…" : busy ? "Working…" : "Talk to assistant"}
          </button>
          <button
            onClick={() => startConversation({ recordMs: 3000 })}
            disabled={recording || busy}
            className="btn btn-quick"
          >
            Quick (3s)
          </button>
        </div>

        <div className="info-boxes">
          <div className="info-section">
           <strong style={{ color: "red" }}>Detected Language:</strong>

            <div className="info">{language || "—"}</div>
          </div>

          <div className="info-section">
            <strong style={{ color: "red" }}>Transcript:</strong>
            <div className="info transcript">{transcript || "—"}</div>
          </div>

          <div className="info-section">
            <strong style={{ color: "red" }}>AI Reply:</strong>
            <div className="info reply">{aiReply || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
