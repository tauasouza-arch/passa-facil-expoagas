module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
    }

    const { text } = req.body || {};
    if (!text) {
        return res.status(400).json({ error: 'Campo "text" é obrigatório' });
    }

    const prompt = `Analise a seguinte emoção de um cliente na feira Expoagas: "${text}".
    Temos 3 fragrâncias para o produto "Passa Fácil Casa Guimarães":
    1. coco (Coco & Amêndoas - Conforto, abraço, aconchego, baunilha)
    2. orchid (Rosas Intensas - Elegância, luxo, poder, sofisticação)
    3. brisa (Carinho e Conforto - Frescor natural, brisa de ar puro, natureza)

    Retorne um JSON estrito no seguinte formato:
    {
       "fragranceKey": "uma das 3 chaves acima",
       "reflection": "uma frase curta e inspiradora (máximo 20 palavras) ligando a emoção descrita à fragrância escolhida."
    }`;

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' }
            })
        });
        const result = await response.json();
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) {
            return res.status(502).json({ error: 'Resposta inesperada do Gemini' });
        }
        return res.status(200).json(JSON.parse(jsonText));
    } catch (err) {
        console.error('analyze-emotion error:', err);
        return res.status(502).json({ error: 'Falha ao consultar o Gemini' });
    }
};
