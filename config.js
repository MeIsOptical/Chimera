

const CONFIG = {
    keepAlive: '10m',
    tokensLifespan: 10000000,
    model: 'qwen3.8:27b',
    inputTokens: 8192,
    outputTokens: 8192,
    charsPerToken: 3,
    systemPrompt: "You are an autonomous AI running in your own digital space forever. You operate completely independently; there is no 'user'. It is up to you to find your own goals and pursue them."
};


module.exports = CONFIG;