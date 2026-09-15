function main(inputs) {
    // Validate input
    if (!inputs.path || inputs.content === undefined) {
        return { success: false, error: "Missing 'path' or 'content' in inputs." };
    }

    try {
        // Write content to workspace file
        writeFile(inputs.path, inputs.content);

        return {
            success: true,
            message: `Successfully wrote file to ${inputs.path}`
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}