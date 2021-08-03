
function parseURL(url) {
    if (url.substring(0,4) != 'http') {
        url = 'http://'+url;
    };
    return url;
};

