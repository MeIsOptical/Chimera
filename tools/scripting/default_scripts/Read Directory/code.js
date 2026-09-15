function main(inputs) {
    const targetPath = inputs.path || '.';

    try {
        // Read directory contents
        const files = readDir(targetPath);

        return {
            success: true,
            path: targetPath,
            files: files
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}