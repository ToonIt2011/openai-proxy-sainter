export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Você é um assistente que ajuda usuários a escrever e-mails com clareza e tom adequado.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        error: 'Erro da Groq detectado.',
        detalhe: data.error
      });
    }

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({
        error: 'Resposta da Groq sem choices.',
        corpoCompleto: data
      });
    }

    return res.status(200).json({ result: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({
      error: 'Erro interno ao gerar e-mail com IA.',
      detalhe: err.message
    });
  }
}
