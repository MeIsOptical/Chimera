
const fs = require('fs');
const path = require('path');


// Define the path to the sandbox workspace
const WORKSPACE_DIR = path.resolve(__dirname, '../../workspace/files');



// Ensure workspace exists on startup
if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}




// Resolve path and prevent directory traversal out of workspace
function resolveSafePath(pPath) {
    const safePath = path.resolve(WORKSPACE_DIR, pPath);

    if (!safePath.startsWith(WORKSPACE_DIR)) {
        throw new Error('Access denied: Path is outside workspace.');
    }

    try {
        // Create directory if missing
        const dirPath = path.dirname(safePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    catch (error) {
        throw new Error(`Failed to resolve path '${pPath}'`);
    }

    return safePath;
}



function safeReadFile(pPath) {
    const targetPath = resolveSafePath(pPath);

    if (!fs.existsSync(targetPath)) {
        throw new Error(`File not found: '${pPath}'`);
    }

    try {
        return fs.readFileSync(targetPath, 'utf8');
    }
    catch (error) {
        throw new Error(`Could not read file '${pPath}'`);
    }
}



function safeReadDir(pPath = '.') {
    const targetPath = resolveSafePath(pPath);

    if (!fs.existsSync(targetPath)) {
        throw new Error(`Directory not found: '${pPath}'`);
    }

    try {
        if (!fs.statSync(targetPath).isDirectory()) {
            throw new Error(`Path is not a directory: '${pPath}'`);
        }
        return fs.readdirSync(targetPath);
    } catch (error) {
        throw new Error(`Could not read directory '${pPath}'`);
    }
}



function safeWriteFile(pPath, pContent) {
    const targetPath = resolveSafePath(pPath);
    const tempPath = `${targetPath}.tmp`;

    try {
        // write to temp file and swap
        fs.writeFileSync(tempPath, pContent, 'utf8');
        fs.renameSync(tempPath, targetPath);
        return true;
    } catch (error) {
        throw new Error(`Could not write to file '${pPath}'`);
    }
}




function safeMoveFile(pOldPath, pNewPath) {
    const oldTargetPath = resolveSafePath(pOldPath);

    if (!fs.existsSync(oldTargetPath)) {
        throw new Error(`Source not found: '${pOldPath}'`);
    }

    try {
        const newTargetPath = resolveSafePath(pNewPath);
        fs.renameSync(oldTargetPath, newTargetPath);
        return true;
    } catch (error) {
        throw new Error(`Could not move file from '${pOldPath}' to '${pNewPath}'`);
    }
}




function safeDeleteFile(pPath) {
    const targetPath = resolveSafePath(pPath);

    if (!fs.existsSync(targetPath)) {
        throw new Error(`Path not found: '${pPath}'`);
    }

    try {
        fs.rmSync(targetPath, { recursive: true, force: true });
        return true;
    } catch (error) {
        throw new Error(`Could not delete file '${pPath}'`);
    }
}




module.exports = {
    safeReadFile,
    safeReadDir,
    safeWriteFile,
    safeMoveFile,
    safeDeleteFile
};