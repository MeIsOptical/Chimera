

async function safeFetch(pTargetUrl, pOptions) {
    const url = new URL(pTargetUrl);

    // Block local files or custom protocols
    if (url.protocol !== 'https:') {
        throw new Error('invalid protocol strictly enforces https:');
    }

    const response = await fetch(url.toString(), pOptions);

    // Extract headers into a flat object for serialization
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
        headers[key] = value;
    }

    return {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
        body: await response.text()
    };
}



module.exports = {
    safeFetch
};