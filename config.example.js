
const CONFIG = {

    // How long to keep the model loaded in memory after the last request (e.g. -1 for never, '30m' for 30 minutes, '1h' for 1 hour)
    keepAlive: '10m',

    // How many tokens the agent can use before "dying". Set to -1 to disable.
    tokensLifespan: 10000000,

    // The local LLM to use from Ollama
    model: 'qwen3.8:27b',

    // The maximum amount of input tokens to hold
    inputTokens: 8192,

    // The maximum amount of output tokens to generate
    outputTokens: 8192,

    // Optional Discord webhook URL for the AI to post to.
    discordWebhook: "",

    // The average number of characters per token (do not change)
    charsPerToken: 3
};


module.exports = CONFIG;