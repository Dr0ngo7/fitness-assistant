const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const https = require('https');

async function testGemini() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: No API Key found in .env file");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Testing with gemini-2.5-flash...");
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testGemini();
