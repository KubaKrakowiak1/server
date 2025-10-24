const fs = require('fs');
const { logAccess } = require('../utils/logger');
const { errorPage } = require('../utils/errorHandler');
const guestFile = './data/guests.json';

module.exports = (res, ip, path, styl) => {
    fs.writeFile(guestFile, JSON.stringify([], null, 2), err => {
        if (err) {
            errorPage(res, 500, 'Nie udało się wyczyścić listy', styl);
            logAccess(ip, path, 500);
        } else {
            res.end(`${styl}<p>Lista została wyczyszczona.</p><a href="/">Powrót</a>`);
            logAccess(ip, path, 200);
        }
    });
};
