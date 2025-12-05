(function (global) {
    class HttpError extends Error {
        constructor(message, status, statusText, url, body) {
            super(message);
            this.name = 'HttpError';
            this.status = status;
            this.statusText = statusText;
            this.url = url;
            this.body = body;
        }
    }

    class TimeoutError extends Error {
        constructor(message, timeout, url) {
            super(message);
            this.name = 'TimeoutError';
            this.timeout = timeout;
            this.url = url;
        }
    }

    class Ajax {
        /**
         * @param {Object} options
         * @param {string} [options.baseURL]
         * @param {Object} [options.headers]
         * @param {number} [options.timeout]
         */
        constructor(options = {}) {
            this.baseURL = options.baseURL || '';
            this.headers = {
            Accept: 'application/json',
            ...(options.headers || {})
        };
        this.timeout = typeof options.timeout === 'number' ? options.timeout : 5000;

        this.lastResponse = null;
    }

    async _request(method, url, options = {}) {
        const finalMethod = method.toUpperCase();
        const timeout = typeof options.timeout === 'number' ? options.timeout : this.timeout;

        const isAbsolute = /^https?:\/\//i.test(url);
        const fullUrl = isAbsolute
        ? url
        : this.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');

        const headers = {
            ...this.headers,
            ...(options.headers || {})
        };

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const fetchOptions = {
            method: finalMethod,
            headers,
            signal: controller.signal
        };

        if (options.data !== undefined && finalMethod !== 'GET' && finalMethod !== 'HEAD') {
        if (!fetchOptions.headers['Content-Type']) {
            fetchOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
        }
        fetchOptions.body =
            typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
        }

        const start = performance.now();

        try {
            const response = await fetch(fullUrl, fetchOptions);
            const duration = performance.now() - start;
            clearTimeout(id);

            const contentType = response.headers.get('content-type') || '';
            let body;
            if (contentType.includes('application/json')) {
                body = await response.json();
            } else {
                body = await response.text();
            }

            if (!response.ok) {
                const message = `Błąd HTTP ${response.status} (${response.statusText}) podczas wywoływania ${fullUrl}`;
                throw new HttpError(message, response.status, response.statusText, fullUrl, body);
            }

            const meta = {
                data: body,
                status: response.status,
                statusText: response.statusText,
                url: fullUrl,
                duration,
                timeoutUsed: timeout
            };

            this.lastResponse = meta;
            return meta;
            } catch (err) {
            clearTimeout(id);

            if (err.name === 'AbortError') {
                throw new TimeoutError(
                `Przekroczono czas oczekiwania (${timeout} ms) dla ${fullUrl}`,
                timeout,
                fullUrl
                );
            }

            throw err;
        }
    }

    async get(url, options = {}) {
        const res = await this._request('GET', url, options);
        return res.data;
    }

    async post(url, data, options = {}) {
        const res = await this._request('POST', url, { ...options, data });
        return res.data;
    }

    async put(url, data, options = {}) {
        const res = await this._request('PUT', url, { ...options, data });
        return res.data;
    }

    async delete(url, options = {}) {
        const res = await this._request('DELETE', url, options);
        return res.data;
    }
    }

    global.Ajax = Ajax;
    global.HttpError = HttpError;
    global.TimeoutError = TimeoutError;
})(window);