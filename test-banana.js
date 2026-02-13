const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testImageGen() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Testing the futuristic Nano Banana Pro preview
    const model = genAI.getGenerativeModel({ model: "models/nano-banana-pro-preview" });

    try {
        console.log("Calling Nano Banana Pro...");
        const result = await model.generateContent("A cozy photo of a man laughing in a sunlit kitchen, high fidelity, realistic.");
        console.log("Response Keys:", Object.keys(result.response));
        // Some models return candidates with image blobs
        if (result.response.candidates[0].content.parts[0].inlineData) {
            console.log("✅ Image data found in response!");
        } else {
            console.log("❌ No image data, model might be text-only in this SDK or returned text.");
            console.log("Text:", result.response.text());
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testImageGen();
