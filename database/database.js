const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("grand-year-database.db");

// NEWS
database.run(`
	CREATE TABLE IF NOT EXISTS news (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        post TEXT,
        image TEXT
	);
`);

// EXPERIENCES
database.run(`
	CREATE TABLE IF NOT EXISTS experiences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        username TEXT,
        experience TEXT
	);
`);

// CONTACT
database.run(`
	CREATE TABLE IF NOT EXISTS contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT,
		message TEXT,
        response TEXT
	);
`);

module.exports = database;
