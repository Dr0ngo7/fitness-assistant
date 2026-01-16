import { GoogleGenerativeAI } from "@google/generative-ai";

const ENV_KEYS = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
// Virgülle ayrılmış keyleri diziye çevir ve boşlukları temizle
const API_KEYS = ENV_KEYS.split(',').map(k => k.trim()).filter(k => k.length > 0);

if (API_KEYS.length === 0) {
    console.error("Gemini API Key is missing! Please check your .env file.");
}

// Key yönetim sistemi
let currentKeyIndex = 0;

console.log(`[Gemini Service] Loaded ${API_KEYS.length} API keys from environment.`);

const getModel = () => {
    if (API_KEYS.length === 0) return null;
    const currentKey = API_KEYS[currentKeyIndex];
    // console.log(`[Gemini Service] Using Key #${currentKeyIndex + 1} (${currentKey.slice(0, 5)}...)`);
    const genAI = new GoogleGenerativeAI(currentKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

// Bir sonraki anahtara geç
const rotateKey = () => {
    if (API_KEYS.length <= 1) {
        console.warn("[Gemini Service] Rotation failed: Only 1 key available.");
        return false;
    }

    const oldIndex = currentKeyIndex;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`⚠️ [Gemini Service] Switching Key: #${oldIndex + 1} -> #${currentKeyIndex + 1}`);
    return true;
};

// Güvenli çalıştırma sarmalayıcısı (Rotation Logic)
async function safeExecute(operation) {
    let attempts = 0;
    const maxAttempts = API_KEYS.length;

    while (attempts < maxAttempts) {
        try {
            const model = getModel();
            if (!model) throw new Error("API Keys missing configuration.");

            return await operation(model);

        } catch (error) {
            const errorMsg = error.toString();
            console.warn(`[Gemini Service] Attempt ${attempts + 1}/${maxAttempts} failed:`, errorMsg.slice(0, 100)); // Log first 100 chars of error

            // 429: Too Many Requests, Quota Exceeded, Resource Exhausted
            const isQuotaError = errorMsg.includes("429") ||
                errorMsg.includes("quota") ||
                errorMsg.includes("RESOURCE_EXHAUSTED") ||
                errorMsg.includes("Too Many Requests");

            if (isQuotaError) {
                const switched = rotateKey();
                if (!switched) throw error;
            } else {
                throw error;
            }
        }
        attempts++;
    }
    throw new Error(`All ${API_KEYS.length} API keys are exhausted or invalid.`);
}

export async function askGemini(prompt) {
    try {
        return await safeExecute(async (model) => {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        });
    } catch (error) {
        console.error("Gemini Error:", error);
        return "AI cevap üretemedi. (Tüm anahtarlar kotayı doldurmuş olabilir)";
    }
}

export async function askGeminiJSON(prompt) {
    try {
        return await safeExecute(async (model) => {
            // JSON Config
            const genAI = new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
            const jsonModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await jsonModel.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(text);
        });
    } catch (error) {
        console.error("Gemini JSON Error:", error);
        throw error;
    }
}
