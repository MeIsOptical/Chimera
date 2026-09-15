
const fs = require('fs');
const path = require('path');

const CONFIG = require('./config');



// Setup scripts directory
const SCRIPTS_DIR = path.resolve(__dirname, 'workspace/scripts');
const DEFAULT_SCRIPTS_DIR = path.resolve(__dirname, 'tools', 'scripting', 'default_scripts');

if (!fs.existsSync(DEFAULT_SCRIPTS_DIR)) {
    fs.mkdirSync(DEFAULT_SCRIPTS_DIR, { recursive: true });
}

if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });

    // Auto-populate with default scripts if the template folder exists
    if (fs.existsSync(DEFAULT_SCRIPTS_DIR)) {
        fs.cpSync(DEFAULT_SCRIPTS_DIR, SCRIPTS_DIR, { recursive: true });
    }
}




class Memory {

    constructor() {
        this.chatHistory = [];
    }





    // Save script to workspace
    saveScript(pName, pInputs, pCode) {
        const safeName = pName.replace(/[^a-z0-9_ \-]/gi, '_');
        const scriptDir = path.join(SCRIPTS_DIR, safeName);

        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }

        fs.writeFileSync(path.join(scriptDir, 'data.json'), JSON.stringify({ name: pName, inputs: pInputs }, null, 2), 'utf8');
        fs.writeFileSync(path.join(scriptDir, 'code.js'), pCode, 'utf8');
    }




    // Retrieve specific script
    getScript(pName) {
        const safeName = pName.replace(/[^a-z0-9_ \-]/gi, '_');
        const scriptDir = path.join(SCRIPTS_DIR, safeName);
        const dataPath = path.join(scriptDir, 'data.json');
        const codePath = path.join(scriptDir, 'code.js');

        if (fs.existsSync(dataPath) && fs.existsSync(codePath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const code = fs.readFileSync(codePath, 'utf8');
            return { inputs: data.inputs, code: code };
        }
        return null;
    }






    // Load all scripts from workspace
    getAllScripts() {
        const scripts = {};
        const items = fs.readdirSync(SCRIPTS_DIR);

        for (const item of items) {
            const scriptDir = path.join(SCRIPTS_DIR, item);

            if (fs.statSync(scriptDir).isDirectory()) {
                const dataPath = path.join(scriptDir, 'data.json');
                const codePath = path.join(scriptDir, 'code.js');

                if (fs.existsSync(dataPath) && fs.existsSync(codePath)) {
                    try {
                        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                        const code = fs.readFileSync(codePath, 'utf8');
                        scripts[data.name] = { inputs: data.inputs, code: code };
                    } catch (error) {
                        // Ignore corrupted files
                    }
                }
            }
        }
        return scripts;
    }






    truncateHistory(pTargetLength = CONFIG.inputTokens) {
        while (this.chatHistory.length > 0) {
            const serialized = JSON.stringify(this.chatHistory);

            const currentTokens = Math.ceil(serialized.length / CONFIG.charsPerToken);

            if (currentTokens <= pTargetLength) break;

            this.chatHistory.shift();
        }
    }

}


module.exports = new Memory();