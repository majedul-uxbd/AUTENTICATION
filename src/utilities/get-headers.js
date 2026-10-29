const getHeaders = (data) => {
    const headers = Object.keys(data).map(
        _d => {
            return _d
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());
        }
    );

    return headers;
}

module.exports = {
    getHeaders
}