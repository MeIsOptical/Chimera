async function main(inputs) {
    // Validate input
    if (!inputs.url) {
        return { success: false, error: "Missing 'url' in inputs." };
    }

    try {
        // Construct fetch options
        const options = {
            method: inputs.method ? inputs.method.toUpperCase() : 'GET'
        };

        // Attach body if provided
        if (inputs.body) {
            options.body = typeof inputs.body === 'string' ? inputs.body : JSON.stringify(inputs.body);

            // Automatically append JSON content-type if an object was passed
            if (typeof inputs.body === 'object') {
                options.headers = {
                    'Content-Type': 'application/json'
                };
            }
        }

        // Fetch the URL
        const response = await fetch(inputs.url, options);
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