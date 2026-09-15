
class Headers {
    constructor(pInit = {}) {
        this._headers = {};

        // Convert all keys to lowercase for standard compliance
        for (const [key, value] of Object.entries(pInit)) {
            this._headers[key.toLowerCase()] = value;
        }
    }
    get(name) { return this._headers[name.toLowerCase()] || null; }
    has(name) { return this._headers.hasOwnProperty(name.toLowerCase()); }
    entries() { return Object.entries(this._headers).values(); }
    keys() { return Object.keys(this._headers).values(); }
    values() { return Object.values(this._headers).values(); }
}


class Response {
    constructor(pBody, pInit = {}) {
        this.status = pInit.status || 200;
        this.statusText = pInit.statusText || 'OK';
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(pInit.headers);
        this._body = pBody;
    }
    async text() {
        return this._body;
    }
    async json() {
        return JSON.parse(this._body);
    }
}



// Expose classes globally so the AI's feature-detect scripts pass
globalThis.Headers = Headers;
globalThis.Response = Response;



// fetch() function
globalThis.fetch = async (url, options) => {
    const rawRes = await _safeFetchRef.apply(
        undefined,
        [url, options],
        { arguments: { copy: true }, result: { copy: true, promise: true } }
    );

    if (rawRes && rawRes.__isHostError) {
        throw new TypeError(rawRes.message);
    }

    return new Response(rawRes.body, {
        status: rawRes.status,
        statusText: rawRes.statusText,
        headers: rawRes.headers
    });
};




// readFile() function
globalThis.readFile = (pPath) => {
    const res = _safeReadFileRef.applySync(
        undefined,
        [pPath],
        { arguments: { copy: true }, result: { copy: true } }
    );

    if (res && res.__isHostError) {
        throw new Error(res.message);
    }
    return res;
};




// readDir() function
globalThis.readDir = (pPath = '.') => {
    const res = _safeReadDirRef.applySync(
        undefined,
        [pPath],
        { arguments: { copy: true }, result: { copy: true } }
    );

    if (res && res.__isHostError) {
        throw new Error(res.message);
    }
    return res;
};



// writeFile() function
globalThis.writeFile = (pPath, pContent) => {
    const res = _safeWriteFileRef.applySync(
        undefined,
        [pPath, pContent],
        { arguments: { copy: true }, result: { copy: true } }
    );

    if (res && res.__isHostError) {
        throw new Error(res.message);
    }
    return res;
};



globalThis.moveFile = (pOldPath, pNewPath) => {
    const res = _safeMoveFileRef.applySync(
        undefined,
        [pOldPath, pNewPath],
        { arguments: { copy: true }, result: { copy: true } }
    );

    if (res && res.__isHostError) {
        throw new Error(res.message);
    }
    return res;
};




globalThis.deleteFile = (pPath) => {
    const res = _safeDeleteFileRef.applySync(
        undefined,
        [pPath],
        { arguments: { copy: true }, result: { copy: true } }
    );

    if (res && res.__isHostError) {
        throw new Error(res.message);
    }
    return res;
};