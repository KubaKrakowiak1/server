const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

let liczbaOdwiedzin = 0;
let odwiedziny = {};  

const goscie = "guests.json";

if (!fs.existsSync(goscie)) {
    fs.writeFileSync(goscie, JSON.stringify([]));
}

const styl = `
    <style>
        body { font-family: Arial; background: #f4f4f4; padding: 20px; }
        h1 { color: #333; }
        ul { background: #fff; padding: 10px; list-style-type: none; }
        li { padding: 5px 0; border-bottom: 1px solid #ddd; }
        form { background: #fff; padding: 20px; }
        input[type="text"] { padding: 8px; margin-right: 10px; }
        input[type="submit"] { padding: 8px 16px; }
        .msg { margin-top: 20px; font-weight: bold; color: green; }
    </style>
`;

const serwer = http.createServer((req, res) => {
    const zapytanieURL = url.parse(req.url, true);
    const sciezka = zapytanieURL.pathname;
    const zapytanie = zapytanieURL.query;
    const ip = req.socket.remoteAddress;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    liczbaOdwiedzin++;
    odwiedziny[ip] = (odwiedziny[ip] || 0) + 1;


    if (sciezka === "/") {
        res.end(`
            ${styl}
            <h1>Witaj!</h1>
            <p>Odwiedziłeś tę stronę ${liczbaOdwiedzin} razy.</p>
            <p><a href="/statystyki">Statystyki odwiedzin</a></p>
            <p><a href="/lista">Lista gości</a></p>
            <p><a href="/formularz">Dodaj gościa</a></p>
        `);
    }

    else if (sciezka === "/statystyki") {
        const listaStatystyk = Object.entries(odwiedzinyIP).map(
            ([ip, liczba]) => `<li>${ip}: ${liczba} odwiedzin</li>`
        ).join("");

        res.end(`
            ${styl}
            <h1>Statystyki odwiedzin</h1>
            <ul>${listaStatystyk}</ul>
            <a href="/">Powrót</a>
        `);
    }

    else if (sciezka === "/lista") {
        fs.readFile(goscie, "utf8", (err, data) => {
            const goscieLista = JSON.parse(data || "[]");

            if (!goscieLista.length) {
                res.end(`${styl}<p>Lista gości jest pusta.</p><a href="/">Powrót</a>`);
                return;
            }

            const listaGosci = goscie.map(g => `<li>${g}</li>`).join("");
            res.end(`
                ${styl}
                <h1>Lista gości</h1>
                <ul>${listaGosci}</ul>
                <a href="/">Powrót</a>
            `);
        });
    }

    else if (sciezka === "/formularz") {
        res.end(`
            ${styl}
            <h1>Dodaj gościa</h1>
            <form action="/dodaj" method="GET">
                <input type="text" name="name" placeholder="Wpisz imię" required />
                <input type="submit" value="Dodaj" />
            </form>
            <a href="/">Powrót</a>
        `);
    }

    else if (sciezka === "/dodaj") {
        const imie = zapytanie.name?.trim();

        if (!imie) {
            res.end(`${styl}<p class="msg">Brak parametru "name".</p><a href="/formularz">Powrót</a>`);
            return;
        }

        fs.readFile(goscie, "utf8", (err, data) => {
            const goscieJson = JSON.parse(data || "[]");
            goscieJson.push(imię);
            fs.writeFile(goscie, JSON.stringify(goscieJson, null, 2), () => {
                res.end(`${styl}<p class="msg">Dodano gościa: ${imie}</p><a href="/lista">Zobacz listę</a>`);
            });
        });
    }

    else if (sciezka === "/usuń") {
        const imie = zapytanie.name?.trim();

        if (!imie) {
            res.end(`${styl}<p class="msg">Podaj imię do usunięcia: /usuń?name=Imię</p>`);
            return;
        }

        fs.readFile(goscie, "utf8", (err, data) => {
            let goście = JSON.parse(data || "[]");
            const początkowaLiczbaGości = goście.length;
            goście = goście.filter(g => g !== imię);

            if (goście.length === początkowaLiczbaGości) {
                res.end(`${styl}<p class="msg">Nie znaleziono gościa: ${imie}</p><a href="/lista">Powrót</a>`);
                return;
            }

            fs.writeFile(goscie, JSON.stringify(goście, null, 2), () => {
                res.end(`${styl}<p class="msg">Usunięto gościa: ${imie}</p><a href="/lista">Powrót</a>`);
            });
        });
    }

    else if (sciezka === "/wyczyść") {
        fs.writeFile(goscie, JSON.stringify([], null, 2), () => {
            res.end(`${styl}<p>Lista gości została wyczyszczona.</p><a href="/">Powrót</a>`);
        });
    }

    else {
        res.statusCode = 404;
        res.end(`${styl}<h1>404 - Strona nie istnieje</h1><a href="/">Powrót</a>`);
    }
});

serwer.listen(3000, () => {
    console.log("Serwer działa na porcie http://localhost:3000");
});
