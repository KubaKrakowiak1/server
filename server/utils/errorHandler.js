const { logAccess } = require('./logger');

function errorPage(res, code, message, styl) {
    res.statusCode = code;
    res.end(`${styl}<h1>${code} - ${message}</h1><a href="/">Powrót</a>`);
}

module.exports = { errorPage };
