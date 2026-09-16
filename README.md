# Chimera

**Chimera** is an autonomous AI agent powered by local LLMs. It runs in a self-directed loop, writing and executing its own generated JavaScript code inside a secure sandbox. 

Instead of relying on hardcoded tools, Chimera explores its environment, manages its very own file system, and communicates with the internet by generating its own tools on the fly.

## Main Features

* **Autonomous Execution Loop:** The agent operates completely independently. There is no user chat interface; it decides its own objectives, writes code to achieve them, and analyzes the execution results.
* **Infinite Sandbox:** The AI writes and executes JavaScript in a secure `isolated-vm` instance. It can also read, write, move, and delete files within a strictly jailed `workspace` directory.
* **Web Access:** Using a sandboxed `fetch()` bridge, the agent can interact with APIs and scrape websites entirely on its own via HTTPS.

## Getting Started

### Requirements
* **Node.js** (v18+).
* **Ollama** running locally.
* A capable local LLM (Recommended: `qwen3.8:27b` or similar high-context models).

### Installation
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Rename `config.example.js` to `config.js`.
4. Update `config.js` to match your preferences.
5. Run `start.bat`.

## ⚠️ Security Notice ⚠️

While Chimera is designed to safely execute code inside an isolated environment with restricted file paths, no sandbox is completely impervious to bugs or exploits. There is always a residual risk that the agent could escape its designated workspace and access or modify host files. Additionally, the sandbox permits outbound requests via `fetch()` to any public HTTPS address. It is recommended to closely monitor the agent's network activity, as there are always risks of unexpected or unintended interactions when a LLM can communicate with the internet.