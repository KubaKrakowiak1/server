const { logAccess } = require('../utils/logger');

module.exports = (res, ip, path, styl, liczbaOdwiedzin) => {
    res.end(`${styl}
        <h1>Witaj!</h1>
        <p>Odwiedzin razem: ${liczbaOdwiedzin}</p>
        <p><a href="/lista">Lista gości</a></p>
        <p><a href="/formularz">Dodaj gościa</a></p>
    `);
    logAccess(ip, path, 200);
};
