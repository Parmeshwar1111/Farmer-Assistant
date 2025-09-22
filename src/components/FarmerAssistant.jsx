// src/components/FarmerAssistant.jsx
import React, { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import FarmerUI from "./FarmerUI";

export default function FarmerAssistant() {
  const { recording, transcript, aiReply, language, busy, startConversation } = useContext(DataContext);

  return (
    <FarmerUI
      transcript={transcript}
      aiReply={aiReply}
      language={language}
      recording={recording}
      busy={busy}
      startConversation={startConversation}
    />
  );
}
