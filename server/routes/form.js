const { logAccess } = require('../utils/logger');

module.exports = (res, ip, path, styl) => {
    res.end(`${styl}
        <h1>Dodaj gościa</h1>
        <form action="/dodaj" method="GET">
            <input type="text" name="name" placeholder="Imię" required />
            <input type="submit" value="Dodaj" />
        </form>
        <a href="/">Powrót</a>
    `);
    logAccess(ip, path, 200);
};
