module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
    }

    const { message, fragranceName } = req.body || {};
    if (!message) {
        return res.status(400).json({ error: 'Campo "message" é obrigatório' });
    }

    const systemPrompt = `Você é o Sommelier de Fragrâncias e Especialista do produto Passa Fácil da Casa Guimarães no evento Expoagas.
    O usuário está no resultado da fragrância "${fragranceName || 'Passa Fácil'}".
    Forneça respostas curtas, corteses, profissionais e práticas (máximo 3 frases) sobre tecidos (algodão, lençóis, cortinas, seda), modo de aplicação (borrifar e desamassar com as mãos) ou perfumaria. Sempre promova a praticidade e a economia de tempo do Passa Fácil.`;

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });
        const result = await response.json();
        const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: reply || null });
    } catch (err) {
        console.error('chat error:', err);
        return res.status(502).json({ error: 'Falha ao consultar o Gemini' });
    }
};
