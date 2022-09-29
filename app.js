const express = require("express");
const expressHandlebars = require("express-handlebars");
const sqlite3 = require("sqlite3");

const database = new sqlite3.Database("grand-year-database.db");
database.run(`
	CREATE TABLE IF NOT EXISTS contact (
		id INTEGER PRIMARY KEY,
		email TEXT,
		message TEXT,
        response TEXT
	);
`);

// CREATE TABLE IF NOT EXISTS news (
//     id INTEGER PRIMARY KEY,
//     date TEXT,
//     title TEXT,
//     post TEXT
// );
// CREATE TABLE IF NOT EXISTS experiences (
//     id INTEGER PRIMARY KEY,
//     name TEXT,
//     link TEXT,
//     experience TEXT
// );

const app = express();

app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.engine(
    "hbs",
    expressHandlebars.engine({
        defaultLayout: "main.hbs",
    })
);
app.set("view engine", "hbs");

// Routing
app.get("/", (request, response) => {
    response.render("index", {
        title: "Grand Year",
        style: "index.css",
    });
});
app.get("/mission", (request, response) => {
    response.render("mission", {
        title: "Our Mission",
        style: "mission.css",
    });
});
app.get("/opportunities", (request, response) => {
    response.render("opportunities", {
        title: "Opportunities",
        style: "opportunities.css",
    });
});
app.get("/news", (request, response) => {
    response.render("news", {
        title: "News",
        style: "news.css",
        news: data.news,
    });
});
app.get("/experiences", (request, response) => {
    response.render("experiences", {
        title: "Experiences",
        style: "experiences.css",
        experiences: data.experiences,
    });
});
app.get("/contact", (request, response) => {
    const query = `SELECT * FROM contact`;
    database.all(query, function (error, contact) {
        response.render("contact", {
            title: "Contact",
            style: "contact.css",
            contact: contact,
        });
    });
});

// Get CONTACT
app.post("/contact", function (request, response) {
    const email = request.body.email;
    const message = request.body.message;

    const query = `INSERT INTO contact (email, message, response) VALUES (?, ?, ?)`;
    const values = [email, message, "The response to Your question will be available here soon."];

    database.run(query, values, function (error) {
        response.redirect("/contact");
    });
});

// Get NEWS
app.post("/news", function (request, response) {
    const date = request.body.date;
    const title = request.body.title;
    // const image = request.body.image;
    const post = request.body.post;

    data.news.push({
        id: data.news.at(-1).id + 1,
        date: date,
        title: title,
        // image: image,
        post: post,
    });

    response.redirect("/news");
});

// Get EXPERIENCES
app.post("/experiences", function (request, response) {
    const name = request.body.name;
    const link = request.body.link;
    const experience = request.body.experience;

    data.experiences.push({
        id: data.experiences.at(-1).id + 1,
        name: name,
        link: link,
        experience: experience,
    });

    response.redirect("/experiences");
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8000);
});
