const fs = require('fs');
const { logAccess, logError } = require('../utils/logger');
const { errorPage } = require('../utils/errorHandler');

const guestFile = './data/guests.json';

module.exports = (res, ip, path, styl) => {
    fs.readFile(guestFile, 'utf8', (err, data) => {
        if (err) {
            logError(`Błąd odczytu: ${err}`);
            return errorPage(res, 500, 'Błąd serwera', styl);
        }

        try {
            const list = JSON.parse(data);
            if (list.length === 0) {
                res.statusCode = 204;
                res.end(`${styl}<p>Lista gości jest pusta.</p><a href="/">Powrót</a>`);
                logAccess(ip, path, 204);
                return;
            }

            const htmlList = list.map(x => `<li>${x}</li>`).join('');
            res.end(`${styl}<h1>Lista gości</h1><ul>${htmlList}</ul><a href="/">Powrót</a>`);
            logAccess(ip, path, 200);
        } catch {
            fs.writeFile(guestFile, JSON.stringify([]), () => {});
            errorPage(res, 500, 'Plik był uszkodzony — utworzono nowy.', styl);
            logAccess(ip, path, 500);
        }
    });
};
