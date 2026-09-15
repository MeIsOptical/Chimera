
console.clear();

const memory = require('./memory');
const agent = require('./agent');

async function main() {

    while (true) {
        try {
            agent.nextMove = (await agent.generateNextMove()).tool_to_call;
            const toolResult = await agent.useTool(agent.nextMove);
            memory.chatHistory.push({ role: 'user', content: `[SYSTEM] Result of tool '${agent.nextMove}': ${toolResult}` });    
        }
        catch (error) {
            console.error(`Critical generation error: ${error.message}`);
            memory.chatHistory.push({ role: 'user', content: `[SYSTEM] Critical generation error: ${error.message}` });
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

}

main();