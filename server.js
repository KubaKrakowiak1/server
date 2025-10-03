let http = require("http");
const fs = require("fs");
const url = require("url");

let licznik = 0;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (path === "/") {
        licznik++;
        res.end(`<h1>Witaj na stronie!</h1><p>Odwiedziłeś ją już ${licznik} razy.</p>`);
    } 
    else if (path === "/add") {
        const name = parsedUrl.query.name;

        if (!name) {
            res.end("Brak parametru 'name'. Użyj np. /add?name=Jan");
            return;
        }

        fs.appendFile("guests.txt", name + "\n", () => {
            res.end(`Dodano gościa: ${name}`);
        });
    } 
    else if (path === "/list") {
        fs.readFile("guests.txt", "utf8", (err, data) => {
            if (err || !data.trim()) {
                res.end("Lista gości jest pusta");
            } else {
                const guests = data.trim().split("\n").map(g => `<li>${g}</li>`).join("");
                res.end(`<h2>Lista gości:</h2><ul>${guests}</ul>`);
            }
        });
    } 
    else if (path === "/clear") {
        fs.writeFile("guests.txt", "", () => {
            res.end("Plik guests.txt został wyczyszczony.");
        });
    }
    else {
        res.statusCode = 404;
        res.end("404 - Strona nie istnieje");
    }
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
