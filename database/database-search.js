const database = require("./database.js");

exports.searchContact = (valueSearched, callback) => {
    const query = `SELECT * FROM contact WHERE message LIKE ? OR response LIKE ?`;
    const values = ["%" + valueSearched + "%", "%" + valueSearched + "%"];

    database.all(query, values, (error, contact) => {
        callback(error, contact);
    });
};

exports.searchExperiences = (valueSearched, callback) => {
    const query = `SELECT * FROM experiences WHERE name LIKE ? OR experience LIKE ?`;
    const values = ["%" + valueSearched + "%", "%" + valueSearched + "%"];

    database.all(query, values, (error, experiences) => {
        callback(error, experiences);
    });
};

exports.searchNews = (valueSearched, callback) => {
    const query = `SELECT * FROM news WHERE date LIKE ? OR title LIKE ? OR post LIKE ?`;
    const values = ["%" + valueSearched + "%", "%" + valueSearched + "%", "%" + valueSearched + "%"];

    database.all(query, values, (error, news) => {
        callback(error, news);
    });
};
