const fs = require('fs');
const { logAccess } = require('../utils/logger');
const { errorPage } = require('../utils/errorHandler');
const guestFile = './data/guests.json';

module.exports = (res, ip, path, styl, query) => {
    const name = query.name?.trim();

    if (!name) return errorPage(res, 400, "Brak parametru 'name'", styl);
    if (/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/.test(name) || name.length > 50)
        return errorPage(res, 400, "Nieprawidłowe imię", styl);

    fs.readFile(guestFile, 'utf8', (err, data) => {
        if (err) return errorPage(res, 500, 'Błąd serwera', styl);

        let list = [];
        try { list = JSON.parse(data); } catch { list = []; }
        list.push(name);

        fs.writeFile(guestFile, JSON.stringify(list, null, 2), err2 => {
            if (err2) return errorPage(res, 500, 'Nie można zapisać pliku', styl);
            res.end(`${styl}<p>Dodano gościa: ${name}</p><a href="/lista">Zobacz listę</a>`);
            logAccess(ip, path, 200);
        });
    });
};
