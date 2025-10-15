const http = require("http");
const fs = require("fs");
const url = require("url");

const plikGosci = "guests.json";
const plikLogBledow = "errors.log";
const plikLogWejsc = "access.log";

let liczbaOdwiedzin = 0;
let odwiedziny = {};

process.on("uncaughtException", (err) => {
    const tekst = `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n`;
    fs.appendFile(plikLogBledow, tekst, () => {});
});

process.on("unhandledRejection", (reason) => {
    const tekst = `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`;
    fs.appendFile(plikLogBledow, tekst, () => {});
});

if (!fs.existsSync(plikGosci)) {
    fs.writeFileSync(plikGosci, JSON.stringify([]));
}

const styl = `
<style>
body { font-family: Arial; background: #f4f4f4; padding: 20px; }
h1 { color: #333; }
a { text-decoration: none; color: blue; }
ul { background: #fff; padding: 10px; list-style-type: none; }
</style>
`;

function loguj(ip, sciezka, kod) {
    const wpis = `[${new Date().toLocaleString()}] ${ip} ${sciezka} -> ${kod}\n`;
    fs.appendFile(plikLogWejsc, wpis, () => {});
}

function bladHTML(res, kod, komunikat) {
    res.statusCode = kod;
    res.end(`${styl}<h1>${kod} - ${komunikat}</h1><a href="/">Powrót</a>`);
}

const serwer = http.createServer((req, res) => {
    const urlInfo = url.parse(req.url, true);
    const sciezka = urlInfo.pathname;
    const zapytanie = urlInfo.query;
    const ip = req.socket.remoteAddress;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    liczbaOdwiedzin++;
    odwiedziny[ip] = (odwiedziny[ip] || 0) + 1;

    if (sciezka === "/") {
        res.end(`${styl}
            <h1>Witaj!</h1>
            <p>Odwiedzin razem: ${liczbaOdwiedzin}</p>
            <p><a href="/lista">Lista gości</a></p>
            <p><a href="/formularz">Dodaj gościa</a></p>
        `);
        loguj(ip, sciezka, 200);
    }

    else if (sciezka === "/lista") {
        fs.readFile(plikGosci, "utf8", (err, dane) => {
            if (err) {
                fs.appendFile(plikLogBledow, `[${new Date()}] Błąd odczytu: ${err}\n`, () => {});
                return bladHTML(res, 500, "Błąd serwera");
            }
            try {
                const lista = JSON.parse(dane);
                if (lista.length === 0) {
                    res.statusCode = 204;
                    res.end(`${styl}<p>Lista gości jest pusta.</p><a href="/">Powrót</a>`);
                    loguj(ip, sciezka, 204);
                    return;
                }
                const htmlLista = lista.map(x => `<li>${x}</li>`).join("");
                res.end(`${styl}<h1>Lista gości</h1><ul>${htmlLista}</ul><a href="/">Powrót</a>`);
                loguj(ip, sciezka, 200);
            } catch {
                fs.writeFile(plikGosci, JSON.stringify([]), () => {});
                bladHTML(res, 500, "Plik był uszkodzony — utworzono nowy.");
                loguj(ip, sciezka, 500);
            }
        });
    }

    else if (sciezka === "/formularz") {
        res.end(`${styl}
            <h1>Dodaj gościa</h1>
            <form action="/dodaj" method="GET">
                <input type="text" name="name" placeholder="Imię" required />
                <input type="submit" value="Dodaj" />
            </form>
            <a href="/">Powrót</a>
        `);
        loguj(ip, sciezka, 200);
    }

    else if (sciezka === "/dodaj") {
        const imie = zapytanie.name?.trim();

        if (!imie) {
            bladHTML(res, 400, "Brak parametru 'name'");
            loguj(ip, sciezka, 400);
            return;
        }

        if (/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/.test(imie) || imie.length > 50) {
            bladHTML(res, 400, "Nieprawidłowe imię");
            loguj(ip, sciezka, 400);
            return;
        }

        fs.readFile(plikGosci, "utf8", (err, dane) => {
            if (err) return bladHTML(res, 500, "Błąd serwera");
            let lista = [];
            try {
                lista = JSON.parse(dane);
            } catch {
                lista = [];
            }
            lista.push(imie);
            fs.writeFile(plikGosci, JSON.stringify(lista, null, 2), (err2) => {
                if (err2) {
                    bladHTML(res, 500, "Nie można zapisać pliku");
                    loguj(ip, sciezka, 500);
                } else {
                    res.end(`${styl}<p>Dodano gościa: ${imie}</p><a href="/lista">Zobacz listę</a>`);
                    loguj(ip, sciezka, 200);
                }
            });
        });
    }

    else if (sciezka === "/wyczysc") {
        fs.writeFile(plikGosci, JSON.stringify([], null, 2), (err) => {
            if (err) {
                bladHTML(res, 500, "Nie udało się wyczyścić listy");
                loguj(ip, sciezka, 500);
            } else {
                res.end(`${styl}<p>Lista została wyczyszczona.</p><a href="/">Powrót</a>`);
                loguj(ip, sciezka, 200);
            }
        });
    }

    else {
        bladHTML(res, 404, "Strona nie istnieje");
        loguj(ip, sciezka, 404);
    }
});

serwer.listen(3000, () => {
    console.log("Serwer działa na http://localhost:3000");
});