const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testJSONGen() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return console.error("No API KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        Act as a professional fitness trainer. Create a 3-day weekly workout plan for a Beginner level user who wants to "Build Muscle".
        IMPORTANT: Return the response in STRICT JSON format only. 
        Do not use Markdown code blocks. 
        Do not include any text outside the JSON object.
        Follow this strict schema:
        {
          "week_plan": [
            {
              "day": "monday",
              "day_tr": "Pazartesi",
              "focus": "Target Muscle Group",
              "exercises": [
                {
                  "name": "Exercise Name",
                  "sets": 3,
                  "reps": "10-12",
                  "rest_sec": 60,
                  "notes": "Brief tip"
                }
              ]
            }
          ]
        }
  `;

    console.log("Sending prompt...");
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log("Raw output length:", text.length);

        // Cleanup simulation
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const json = JSON.parse(text);
        console.log("JSON Parsed Successfully!");
        console.log("Days generated:", json.week_plan.length);
        console.log("First day focus:", json.week_plan[0].focus);
    } catch (e) {
        console.error("FAILED:", e);
    }
}

testJSONGen();
