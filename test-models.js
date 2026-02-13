const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // There isn't a direct listModels in the client SDK usually, 
        // it's usually via the Vertex AI or REST API.
        // In the standard @google/generative-ai, we can try to check if it works.
        console.log("Checking model access for gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model object created.");
    } catch (e) {
        console.error(e);
    }
}

listModels();
