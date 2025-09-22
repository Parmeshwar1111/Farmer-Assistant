import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Load API key from .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ Gemini API key missing. Please add VITE_GEMINI_API_KEY in .env");
}

// ✅ Initialize Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // you can also try "gemini-1.5-flash"
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 200, // increase so you don’t get very short replies
  responseMimeType: "text/plain",
};

// ✅ Function to send prompt to Gemini
async function run(prompt) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [], // can add previous messages if you want context
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ Sorry, there was an issue connecting to Gemini.";
  }
}

export default run;
