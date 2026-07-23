function toMessagesArray(promptOrMessages) {
  if (typeof promptOrMessages === 'string') {
    return [{ role: 'user', content: promptOrMessages }];
  }
  if (Array.isArray(promptOrMessages)) {
    return promptOrMessages;
  }
  throw new Error('Invalid prompt format');
}

async function queryGemini(apiKey, promptOrMessages) {
  const messages = toMessagesArray(promptOrMessages);
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
}

async function queryOpenAI(apiKey, promptOrMessages, model = 'gpt-4o-mini') {
  const messages = toMessagesArray(promptOrMessages);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'No response from OpenAI';
}

async function queryClaude(apiKey, promptOrMessages) {
  const messages = toMessagesArray(promptOrMessages);
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const body = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: chatMessages,
  };
  if (systemMsg) body.system = systemMsg.content;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }
  const data = await response.json();
  return data?.content?.[0]?.text || 'No response from Claude';
}

async function queryDeepSeek(apiKey, promptOrMessages) {
  const messages = toMessagesArray(promptOrMessages);
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${err}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'No response from DeepSeek';
}

async function queryMistral(apiKey, promptOrMessages) {
  const messages = toMessagesArray(promptOrMessages);
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral API error: ${err}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'No response from Mistral';
}

async function queryCohere(apiKey, promptOrMessages) {
  const messages = toMessagesArray(promptOrMessages);
  const chatHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
    message: m.content,
  }));
  const lastMessage = messages[messages.length - 1]?.content || '';

  const body = {
    model: 'command-r-plus',
    message: lastMessage,
    chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
    max_tokens: 1024,
    temperature: 0.3,
  };

  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere API error: ${err}`);
  }
  const data = await response.json();
  return data?.text || data?.message?.content?.[0]?.text || 'No response from Cohere';
}

const PROVIDER_HANDLERS = {
  gemini: queryGemini,
  openai: queryOpenAI,
  claude: queryClaude,
  deepseek: queryDeepSeek,
  mistral: queryMistral,
  cohere: queryCohere,
};

async function queryProvider(provider, apiKey, promptOrMessages) {
  const handler = PROVIDER_HANDLERS[provider];
  if (!handler) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
  return handler(apiKey, promptOrMessages);
}

module.exports = { queryProvider, PROVIDER_HANDLERS };
