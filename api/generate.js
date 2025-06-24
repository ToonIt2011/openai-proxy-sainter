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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente que ajuda usuários a escrever e-mails com clareza e tom adequado.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 🚨 NOVA VERIFICAÇÃO: caso venha um erro da OpenAI
    if (data.error) {
      return res.status(500).json({
        error: 'Erro da OpenAI detectado.',
        detalhe: data.error
      });
    }

    // 🚨 AINDA NÃO TEM `choices`? Retorna tudo cru para investigar
    if (!data.choices || !data.choices.length) {
      return res.status(500).json({
        error: 'Resposta da OpenAI sem choices.',
        corpoCompleto: data
      });
    }

    return res.status(200).json({ result: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({
      error: 'Erro no servidor Sainter.',
      detalhe: err.message
    });
  }
}
