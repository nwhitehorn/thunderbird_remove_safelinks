let outlook_regex = /https:\/\/\w+\.safelinks\.protection\.outlook\.com\/\?url=(\S+?)((?:\&amp;data.*)+$|$)/i;
let proofpoint_regex = new RegExp('https://urldefense(?:\.proofpoint)?\.com/(v[0-9])/');

function safelinkDecoder (a) {
    var safelink = a.match(outlook_regex);

    if (!safelink)
        return a

    return decodeURIComponent(safelink[1]);
}

function proofPointDecoder (a) {
    var proofpoint = a.match(proofpoint_regex);
    if (!proofpoint)
        return a;

    var v = proofpoint[1];
    var outurl = a;
    if (v == 'v1') {
        let v1_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v1/url\\?u=([^&]*)&k=.*');
        outurl = decodeURIComponent(a.match(v1_pattern)[1]);
    } else if (v == 'v2') {
        let v2_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v2/url\\?u=([^&]*)&[dc]=.*');
        let url = a.match(v2_pattern)[1].replace(/-/g, '%').replace(/_/g, '/');
        outurl = decodeURIComponent(url);
    } else if (v == 'v3') {
        let v3_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v3/__(.+)__;([^\!]*).*');
        let v3_token_pattern = new RegExp('\\*(\\*.)?', 'g');
        let length_codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let url = a.match(v3_pattern);
        let encbytes = atob(url[2].replace(/_/g, '/').replace(/-/g, '+'));
        let encbytes_off = 0;

        outurl = url[1].replace(v3_token_pattern, (chunk) => {
            var len = 1;
            if (chunk.length > 1)
               len = length_codes.search(chunk[2]) + 2;
            var out = encbytes.substring(encbytes_off, encbytes_off + len);
            encbytes_off += len;
            return out;
        });
    }

    return outurl;
}

module.exports = {
    safelinkDecoder: safelinkDecoder,
    proofPointDecoder: proofPointDecoder,
    outlook_regex: outlook_regex,
    proofpoint_regex: proofpoint_regex
}

if (typeof browser !== 'undefined') {
    browser.runtime.decoders = module.exports;
}
