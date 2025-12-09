import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY!;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function gerarPlano(prompt: string) {
    const response = await axios.post(URL, {
        contents: [{ parts: [{ text: prompt }] }],
    });

    const texto = response.data.candidates[0].content.parts[0].text;
    const jsonLimpo = texto.replace(/```json|```/g, "").trim();

    return JSON.parse(jsonLimpo);
}
