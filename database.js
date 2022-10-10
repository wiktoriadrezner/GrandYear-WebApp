const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("grand-year-database.db");

// NEWS
database.run(`
	CREATE TABLE IF NOT EXISTS news (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        post TEXT
	);
`);

exports.getNewsAll = (callback) => {
    const query = `SELECT * FROM news`;

    database.all(query, (error, news) => {
        callback(error, news);
    });
};

exports.getNewsID = (id, callback) => {
    const query = `SELECT * FROM news WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, newsOne) => {
        callback(error, newsOne);
    });
};

exports.createNews = (date, title, post, callback) => {
    const query = `INSERT INTO news (date, title, post) VALUES (?, ?, ?)`;
    const values = [date, title, post];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.editNews = (newDate, newTitle, newPost, id, callback) => {
    const query = `UPDATE news SET date = ?, title = ?, post = ? WHERE id = ?`;
    const values = [newDate, newTitle, newPost, id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.deleteNews = (id, callback) => {
    const query = "DELETE FROM news WHERE id = ?";
    const values = [id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.updateSequenceNews = (callback) => {
    const query = `UPDATE sqlite_sequence SET seq = 0 WHERE name = "news"`;

    database.get(query, (error) => {
        callback(error);
    });
};

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

exports.getExperiencesAll = (callback) => {
    const query = `SELECT * FROM experiences`;

    database.all(query, (error, experiences) => {
        callback(error, experiences);
    });
};

exports.getExperiencesID = (id, callback) => {
    const query = `SELECT * FROM experiences WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, experiencesOne) => {
        callback(error, experiencesOne);
    });
};

exports.createExperiences = (name, username, experience, email, callback) => {
    const query = `INSERT INTO experiences (name, email, username, experience) VALUES (?, ?, ?, ?)`;
    const values = [name, email, username, experience];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.editExperiences = (newName, newUsername, newExperience, id, callback) => {
    const query = `UPDATE experiences SET name = ?, username = ?, experience = ? WHERE id = ?`;
    const values = [newName, newUsername, newExperience, id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.deleteExperiences = (id, callback) => {
    const query = "DELETE FROM experiences WHERE id = ?";
    const values = [id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.updateSequenceExperiences = (callback) => {
    const query = `UPDATE sqlite_sequence SET seq = 0 WHERE name = "experiences"`;
    database.get(query, (error) => {
        callback(error);
    });
};

// CONTACT
database.run(`
	CREATE TABLE IF NOT EXISTS contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT,
		message TEXT,
        response TEXT
	);
`);

exports.getContactAll = (callback) => {
    const query = `SELECT * FROM contact`;

    database.all(query, (error, contact) => {
        callback(error, contact);
    });
};

exports.getContactID = (id, callback) => {
    const query = `SELECT * FROM contact WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, contactOne) => {
        callback(error, contactOne);
    });
};

exports.createContact = (email, message, callback) => {
    const query = `INSERT INTO contact (email, message, response) VALUES (?, ?, ?)`;
    const values = [email, message, "The response to Your question will be available here soon."];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.editContact = (newMessage, newResponse, id, callback) => {
    const query = `UPDATE contact SET message = ?, response = ? WHERE id = ?`;
    const values = [newMessage, newResponse, id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.deleteContact = (id, callback) => {
    const query = `DELETE FROM contact WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error) => {
        callback(error);
    });
};

exports.updateSequenceContact = (callback) => {
    const query = `UPDATE sqlite_sequence SET seq = 0 WHERE name = "contact"`;

    database.get(query, (error) => {
        callback(error);
    });
};
