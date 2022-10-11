const database = require("./database.js");

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
