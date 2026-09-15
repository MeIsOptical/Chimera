function main(inputs) {
    // Validate input
    if (!inputs.path) {
        return { success: false, error: "Missing 'path' in inputs." };
    }

    try {
        // Read file from workspace
        const content = readFile(inputs.path);

        return {
            success: true,
            content: content
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}