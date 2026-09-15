async function main(inputs) {
    // Validate input
    if (!inputs.url) {
        return { success: false, error: "Missing 'url' in inputs." };
    }

    try {
        // Fetch the URL
        const response = await fetch(inputs.url);
        const text = await response.text();

        return {
            success: true,
            status: response.status,
            data: text
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}