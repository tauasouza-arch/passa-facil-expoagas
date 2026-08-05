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

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text }] }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Aoede' }
                        }
                    }
                }
            })
        });
        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const base64Audio = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType || 'audio/L16;rate=24000';
        if (!base64Audio) {
            return res.status(502).json({ error: 'Áudio indisponível' });
        }
        return res.status(200).json({ base64Audio, mimeType });
    } catch (err) {
        console.error('narrate error:', err);
        return res.status(502).json({ error: 'Falha ao gerar áudio' });
    }
};
