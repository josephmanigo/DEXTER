const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function listModelsBrief() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(m.name);
                }
            });
        } else {
            console.log("No models found:", data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModelsBrief();
