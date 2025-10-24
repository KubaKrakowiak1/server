const http = require('http');
const url = require('url');
const { logAccess } = require('./utils/logger');
const { errorPage } = require('./utils/errorHandler');
const { styl } = require('./utils/style');

const home = require('./routes/home');
const list = require('./routes/list');
const form = require('./routes/form');
const add = require('./routes/add');
const clear = require('./routes/clear');

let liczbaOdwiedzin = 0;
let odwiedziny = {};

function startServer(port) {
    const server = http.createServer((req, res) => {
        const urlInfo = url.parse(req.url, true);
        const path = urlInfo.pathname;
        const query = urlInfo.query;
        const ip = req.socket.remoteAddress;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        liczbaOdwiedzin++;
        odwiedziny[ip] = (odwiedziny[ip] || 0) + 1;

        const routes = {
            '/': () => home(res, ip, path, styl, liczbaOdwiedzin),
            '/lista': () => list(res, ip, path, styl),
            '/formularz': () => form(res, ip, path, styl),
            '/dodaj': () => add(res, ip, path, styl, query),
            '/wyczysc': () => clear(res, ip, path, styl)
        };

        if (routes[path]) {
            routes[path]();
        } else {
            errorPage(res, 404, 'Strona nie istnieje', styl);
            logAccess(ip, path, 404);
        }
    });

    server.listen(port, () => {
        console.log(`Serwer działa na http://localhost:${port}`);
    });
}

module.exports = { startServer };
