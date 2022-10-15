const database = require("./database.js");

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

exports.createNews = (date, title, post, image, callback) => {
    const query = `INSERT INTO news (date, title, post, image) VALUES (?, ?, ?, ?)`;
    const values = [date, title, post, image];

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

exports.getImageName = (id, callback) => {
    const query = `SELECT image FROM news WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, imageName) => {
        callback(error, imageName);
    });
};

exports.deleteNews = (id, callback) => {
    const query = `DELETE FROM news WHERE id = ?`;
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
