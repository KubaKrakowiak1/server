const fs = require('fs');
const path = require('path');

const accessLog = path.join(__dirname, '../data/access.log');
const errorLog = path.join(__dirname, '../data/errors.log');

function logAccess(ip, path, code) {
    const entry = `[${new Date().toLocaleString()}] ${ip} ${path} -> ${code}\n`;
    fs.appendFile(accessLog, entry, () => {});
}

function logError(message) {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(errorLog, entry, () => {});
}

process.on('uncaughtException', err => logError(`Uncaught Exception: ${err.message}`));
process.on('unhandledRejection', reason => logError(`Unhandled Rejection: ${reason}`));

module.exports = { logAccess, logError };
