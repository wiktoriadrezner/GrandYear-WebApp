const database = require("./database.js");

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
