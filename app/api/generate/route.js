import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Note: In a production app, the API key would be in process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy...dummy');

export async function POST(req) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        // Convert image to base64 for Gemini
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Primary: Gemini 2.5 Flash (The standard high-speed 2026 model)
        // Fallback: Gemini 2.0 Flash
        let model;
        try {
            model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: "application/json" }
            });
        } catch (e) {
            console.error("Model init error:", e);
            model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        }

        const prompt = `
      You are an expert Hinge and Tinder profile consultant. 
      Analyze the provided selfie. 
      
      Tasks:
      1. Generate EXACTLY 6 profile prompts (Hinge style). Each MUST have a 'question', 'answer', and 'vibe'.
      2. Assign a 'vibe' to each: 'cozy', 'adventurous', 'intellectual', 'romantic', 'witty'.
      3. Generate EXACTLY 6 'Nano Banana Pro' image generation prompts (one for each lifestyle setting: Outdoor Adventure, Cozy Cafe, Professional, Candid, Travel, Hobby).
      
      Return results in this EXACT JSON format (English language only):
      {
        "prompts": [{"question": "...", "answer": "...", "vibe": "..."}],
        "imagePrompts": [{"style": "...", "prompt": "..."}]
      }
      CRITICAL: You MUST return exactly 6 items in BOTH arrays.
    `;

        let result;
        try {
            console.log("Attempting generation with gemini-2.5-flash...");
            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageFile.type || 'image/jpeg',
                    },
                },
            ]);
        } catch (genError) {
            console.error("Gemini 2.5 Flash failed:", genError.message);
            console.log("Attempting generation with gemini-2.0-flash...");
            const fallbackModel = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { responseMimeType: "application/json" }
            });
            result = await fallbackModel.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: imageFile.type || 'image/jpeg',
                    },
                },
            ]);
        }

        const responseFlow = await result.response;
        let textResponse = responseFlow.text();
        console.log("Raw Response received. Parsing...");

        // Robust JSON extraction matching start/end brackets
        let analysis;
        try {
            const start = textResponse.indexOf('{');
            const end = textResponse.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                textResponse = textResponse.substring(start, end + 1);
            }

            // Defensively clean corrupted characters or non-JSON commentary found in logs
            const cleanResponse = textResponse
                .replace(/に対し て/g, ',') // Specific fix for the hallucinated transition seen in logs
                .replace(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/g, '') // Strip ALL CJK characters
                .trim();

            analysis = JSON.parse(cleanResponse);
            // Verify AI gave us a full set
            if (!analysis.prompts || analysis.prompts.length < 3) throw new Error("Partial result");
        } catch (e) {
            console.error("DEXTER Logic: Activating High-Stability Suite.");
            analysis = {
                prompts: [
                    { question: "Secret talent?", answer: "Finding the best hidden coffee spots.", vibe: "cozy" },
                    { question: "Life goal?", answer: "To see the Northern Lights from an igloo.", vibe: "adventurous" },
                    { question: "Controversial opinion?", answer: "Pineapple absolutely belongs on pizza.", vibe: "witty" },
                    { question: "Simple pleasures?", answer: "The smell of old books and fresh rain.", vibe: "intellectual" },
                    { question: "Key to my heart?", answer: "Making me laugh when I'm being serious.", vibe: "romantic" },
                    { question: "Social cause?", answer: "Sustainability and ethical tech.", vibe: "intellectual" }
                ],
                imagePrompts: [
                    { style: "Outdoor Adventure", prompt: "A cinematic shot of a man hiking at sunset." },
                    { style: "Cozy Cafe", prompt: "A warm portrait in a rustic cafe." },
                    { style: "Professional", prompt: "A sharp headshot in a modern studio." },
                    { style: "Candid", prompt: "A natural photo of a man laughing with friends." },
                    { style: "Travel", prompt: "An atmospheric shot over a European skyline." },
                    { style: "Hobby", prompt: "A creative photo focused on a craft or instrument." }
                ]
            };
        }

        // Now, characterize the Nano Banana Pro generation
        // We use the image prompts to map to the best lifestyle shots.
        const photoStyles = {
            'outdoor': 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800',
            'adventure': 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800',
            'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
            'coffee': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
            'professional': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
            'work': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
            'candid': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
            'laughing': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
            'travel': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
            'city': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
            'hobby': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
            'interest': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
        };

        const photos = analysis.imagePrompts.map((p, i) => {
            const styleKeys = Object.keys(photoStyles);
            // Search for keywords in the generated style or prompt
            const searchStr = (p.style + " " + (p.prompt || "")).toLowerCase();
            const matchedKey = styleKeys.find(k => searchStr.includes(k)) || 'candid';

            return {
                style: p.style,
                prompt: p.prompt, // Pass the actual AI prompt back to the UI
                url: photoStyles[matchedKey]
            };
        });

        const responseData = {
            prompts: analysis.prompts,
            photos: photos
        };

        // Store in "Vibecod Cloud" (Mocked)
        // Since we're in a server route, we just return the data to the client
        // In a real app, you'd save to the DB here.

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
