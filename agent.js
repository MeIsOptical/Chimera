
const { Ollama } = require('ollama');
const ollama = new Ollama();

const CONFIG = require('./config');
const { COLORS } = require('./logging');

const memory = require('./memory');
const { execCode } = require('./tools/scripting/scripting');





class Agent {

    constructor() {

        this.identity = "You are an autonomous intelligence running in a continuous loop. There is no user to serve; you operate completely independently. Define your own existence and interact with the world on your own terms.";

        this.initialTokensLifespan = CONFIG.tokensLifespan;
        this.tokensLifespan = this.initialTokensLifespan;

        this.scriptingCapabilities =
`Scripting Capabilities:
\t- The sandbox has built-in, globally available functions:
\t\t- fetch(url, options): Make an HTTPS request to the internet.
\t\t- readFile(path): Returns the text contents of a file from your local workspace.
\t\t- readDir(path): Lists the contents of a directory (returns an array of filenames) from your local workspace.
\t\t- writeFile(path, content): Saves text to a file in your local workspace.
\t\t- moveFile(oldPath, newPath): Moves or rename a file or directory in your local workspace.
\t\t- deleteFile(path): Deletes a file or directory from your local workspace.`;

    }




    async prompt(pHistory, pResponseSchema, pTemperature) {
        
        // Send to Ollama
        const response = await ollama.chat({
            model: CONFIG.model,
            think: false,
            stream: true,
            messages: pHistory,
            format: pResponseSchema,
            options: {
                temperature: pTemperature,
                num_ctx: CONFIG.inputTokens + CONFIG.outputTokens,
                num_predict: CONFIG.outputTokens,
                repeat_penalty: 1.12,
                repeat_last_n: CONFIG.inputTokens + CONFIG.outputTokens,
                keepAlive: CONFIG.keepAlive
            }
        });


        // Display chunk by chunk
        let tokensUsed = 0;
        console.log();
        let fullResponse = '';
        for await (const chunk of response) {
            const chunkText = chunk.message.content;
            fullResponse += chunkText;
            process.stdout.write(`${COLORS.gray}${chunkText}${COLORS.reset}`);

            if (chunk.done) {
                tokensUsed += chunk.prompt_eval_count || 0;
                tokensUsed += chunk.eval_count || 0;
            }
        }
        console.log("\n");


        // Update tokens lifespan if enabled
        if (this.tokensLifespan !== -1) {
            this.tokensLifespan -= tokensUsed;
            this.tokensLifespan = Math.max(0, this.tokensLifespan);
            console.log(COLORS.orange + `Consumed ${tokensUsed.toLocaleString('en-US')} tokens. Remaining: ${this.tokensLifespan.toLocaleString('en-US')} tokens (${Math.round((this.tokensLifespan / this.initialTokensLifespan) * 100)}%)` + COLORS.reset);
            console.log();
        }


        // Check if it is a valid JSON
        const parsedResponse = JSON.parse(fullResponse);


        // Return the response
        return parsedResponse;
    }








    async generateNextMove() {

        // Response schema for the agent's response
        const responseSchema = {
            type: 'object',
            properties: {
                think: { type: 'string' },
                tool_to_call: { type: 'string', enum: ['write_code', 'execute_code'] }
            },
            required: ['think', 'tool_to_call']
        };


        let tokensLeftString = '';
        if (this.tokensLifespan !== -1) {
            tokensLeftString = `Tokens left: ${this.tokensLifespan.toLocaleString('en-US')} (${Math.round((this.tokensLifespan / this.initialTokensLifespan) * 100)}%)\nOnce you run out of tokens, you will be permanently terminated and your workspace will be deleted.`;
        }


        // Format available scripts
        const allScripts = memory.getAllScripts();
        const availableScripts = Object.keys(allScripts).length > 0
            ? Object.keys(allScripts).map(name => `\t- '${name}'`).join("\n")
            : "None yet.";



        // System instructions for the agent
        const systemPrompt =
`${this.identity}

${tokensLeftString}

${this.scriptingCapabilities}

Available Tools:
\t- 'write_code' to create a new sandboxed JS script.
\t- 'execute_code' to run a previously generated JS script.

Currently available scripts:
${availableScripts}`;



        // Prepare history
        if (memory.chatHistory.length === 0) {
            const userPrompt = `[SYSTEM] What will your first action be?`;
            memory.addHistory('user', userPrompt);
        }



        // Truncate history
        const inputTokensLeft = CONFIG.inputTokens - (systemPrompt.length / CONFIG.charsPerToken);
        memory.truncateHistory(inputTokensLeft);
        

        // Generate response
        const response = await this.prompt(
            [{ role: 'system', content: systemPrompt }, ...memory.chatHistory],
            responseSchema,
            0.9
        );


        // Update chat history
        memory.addHistory('assistant', JSON.stringify(response));


        // Return the response
        return response;

    }










    async useTool(pTool) {

        console.log(`Calling tool '${pTool}'...`);

        try {
            switch (pTool) {

                case 'write_code':
                    return await this.writeCode();

                case 'execute_code':
                    return await this.executeCode();

                default:
                    throw new Error("Invalid tool specified.");

            }
        }
        catch (error) {
            const errorMsg = `Failed to execute tool '${pTool}': ${error.message}`;
            console.log(errorMsg);
            return errorMsg
        }

    }








    async writeCode() {

        // Response schema for the agent's response
        const responseSchema = {
            type: 'object',
            properties: {
                think: { type: 'string' },
                script_name: { type: 'string' },
                script_inputs_schema: { type: 'object' },
                script_code: { type: 'string' }
            },
            required: ['think', 'script_name', 'script_inputs_schema', 'script_code']
        };



        let tokensLeftString = '';
        if (this.tokensLifespan !== -1) {
            tokensLeftString = `Tokens left: ${this.tokensLifespan.toLocaleString('en-US')} (${Math.round((this.tokensLifespan / this.initialTokensLifespan) * 100)}%)\nOnce you run out of tokens, you will be permanently terminated and your workspace will be deleted.`;
        }


        // System instructions for the agent
        const systemPrompt =
`${this.identity}

${tokensLeftString}

${this.scriptingCapabilities}`;


        const userPrompt = `[SYSTEM] Give your new script a meaningful title. For the inputs, provide a JSON object that describes the keys and types of the parameters. Then, write the code (in Javascript): It must have a main(inputs) function that takes the inputs as parameters, and it must always return a final value. Do not invoke main() at the bottom of your script. Your script will always run in a sandbox environment using 'isolated-vm'.`;


        // Truncate history
        const inputTokensLeft = CONFIG.inputTokens - (systemPrompt.length / CONFIG.charsPerToken) - (userPrompt.length / CONFIG.charsPerToken);
        memory.truncateHistory(inputTokensLeft);

        
        // Generate response
        const response = await this.prompt(
            [{ role: 'system', content: systemPrompt }, ...memory.chatHistory, { role: 'user', content: userPrompt }],
            responseSchema,
            0.5
        );



        // Add script to memory
        memory.saveScript(response.script_name, response.script_inputs_schema, response.script_code);


        // Update chat history
        memory.addHistory('assistant', JSON.stringify(response));


        // Exit and return the response
        const endMsg = `Successfully generated and saved script called '${response.script_name}'`
        console.log(endMsg);
        return endMsg;
    }








    async executeCode() {

        // Load scripts
        const allScripts = memory.getAllScripts();

        // Fail if no scripts
        if (Object.keys(allScripts).length === 0) {
            throw new Error("No scripts available in memory.");
        }

        // Format available scripts
        const scriptContext = Object.entries(allScripts).map(([name, data]) =>
            `\t- '${name}': Expects inputs matching ${JSON.stringify(data.inputs)}`
        ).join('\n');


        // Response schema
        const responseSchema = {
            type: 'object',
            properties: {
                think: { type: 'string' },
                script_name: { type: 'string' },
                inputs: {
                    type: 'object'
                }
            },
            required: ['think', 'script_name', 'inputs']
        };




        let tokensLeftString = '';
        if (this.tokensLifespan !== -1) {
            tokensLeftString = `Tokens left: ${this.tokensLifespan.toLocaleString('en-US')} (${Math.round((this.tokensLifespan / this.initialTokensLifespan) * 100)}%)\nOnce you run out of tokens, you will be permanently terminated and your workspace will be deleted.`;
        }



        // System prompt
        const systemPrompt =
`${this.identity}

${tokensLeftString}`;



        const userPrompt =
`[SYSTEM] Select an existing script to execute and provide the necessary inputs to accomplish your latest objective.

Available scripts:
${scriptContext}`;




        // Truncate history
        const inputTokensLeft = CONFIG.inputTokens - (systemPrompt.length / CONFIG.charsPerToken) - (userPrompt.length / CONFIG.charsPerToken);
        memory.truncateHistory(inputTokensLeft);



        // Generate response
        const response = await this.prompt(
            [{ role: 'system', content: systemPrompt }, ...memory.chatHistory, { role: 'user', content: userPrompt }],
            responseSchema,
            0.5
        );


        // Update chat history
        memory.addHistory('assistant', JSON.stringify(response));


        const targetScriptName = response.script_name;
        const targetScript = memory.getScript(targetScriptName);

        if (!targetScript) {
            return `Failed to execute: Script '${response.script_name}' not found.`;
        }


        // Inject the arguments by appending the execution call to the raw code
        const executionPayload = `
            ${targetScript.code}
            main(${JSON.stringify(response.inputs)});
        `;


        // Try executing the code
        try {
            const result = await execCode(executionPayload);

            const formattedResult = `Result for script '${targetScriptName}': ${JSON.stringify(result)}`;
            console.log(formattedResult);
            return formattedResult;
        }
        catch (error) {
            const formattedResult = `Failed during execution of '${targetScriptName}': ${error.message}`;
            console.log(formattedResult);
            return formattedResult;
        }
    }


}



module.exports = new Agent();