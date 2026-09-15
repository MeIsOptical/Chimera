
const fs = require('fs');
const path = require('path');
const ivm = require('isolated-vm');

const bootstrapCode = fs.readFileSync(path.join(__dirname, 'bootstrapCode.js'), 'utf8');

const { safeFetch } = require('../web/fetch');
const { safeReadFile, safeReadDir, safeWriteFile, safeMoveFile, safeDeleteFile } = require('../files/files');





async function execCode(pCode) {

    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    const context = await isolate.createContext();
    const global = context.global;


    
    // Add fetch() function
    global.setSync('_safeFetchRef', new ivm.Reference(async (url, options) => {
        try {
            return await safeFetch(url, options);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    // Add readFile() function
    global.setSync('_safeReadFileRef', new ivm.Reference((pPath) => {
        try {
            return safeReadFile(pPath);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    // Add readDir() function
    global.setSync('_safeReadDirRef', new ivm.Reference((pPath) => {
        try {
            return safeReadDir(pPath);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    // Add writeFile() function
    global.setSync('_safeWriteFileRef', new ivm.Reference((path, content) => {
        try {
            return safeWriteFile(path, content);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    // Add moveFile function
    global.setSync('_safeMoveFileRef', new ivm.Reference((pOldPath, pNewPath) => {
        try {
            return safeMoveFile(pOldPath, pNewPath);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    // Add deleteFile() function
    global.setSync('_safeDeleteFileRef', new ivm.Reference((pPath) => {
        try {
            return safeDeleteFile(pPath);
        } catch (error) {
            return { __isHostError: true, message: error.message };
        }
    }));

    


    // Add bootstrap code
    await context.evalClosure(`${bootstrapCode}`);

    
    // Try to execute the code
    try {
        const script = await isolate.compileScript(pCode);
        return await script.run(context, { timeout: 2000, promise: true, copy: true });
    }
    finally {
        isolate.dispose();
    }

}




module.exports = {
    execCode
};