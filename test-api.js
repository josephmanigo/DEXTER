const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testCall() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Calling generateContent...");
        const result = await model.generateContent("Hello, are you there?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error Status:", e.status);
        console.error("Error Message:", e.message);
        if (e.response) {
            console.error("Response Data:", await e.response.json());
        }
    }
}

testCall();
