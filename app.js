const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");

const adminUsername = "dreznerwiktoria";
const adminPassword = "grandYearPass2022()123admin";

// SET UP DATABASE
const database = new sqlite3.Database("grand-year-database.db");
database.run(`
	CREATE TABLE IF NOT EXISTS contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT,
		message TEXT,
        response TEXT
	);
`);
database.run(`
	CREATE TABLE IF NOT EXISTS news (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        post TEXT
	);
`);
database.run(`
	CREATE TABLE IF NOT EXISTS experiences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        link TEXT,
        experience TEXT
	);
`);

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

// SESSION
app.use(
    expressSession({
        saveUninitialized: false,
        resave: false,
        secret: "oiakfgnunwgklyf",
    })
);

// ROUTING
app.get("/", (request, response) => {
    response.render("index", {
        session: request.session,
        title: "Grand Year",
        style: "index.css",
    });
});
app.get("/admin", (request, response) => {
    response.render("admin", {
        title: "Admin",
        style: "admin.css",
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
    const query = `SELECT * FROM news`;
    database.all(query, function (error, news) {
        response.render("news", {
            title: "News",
            style: "news.css",
            news: news,
        });
    });
});
app.get("/experiences", (request, response) => {
    const query = `SELECT * FROM experiences`;
    database.all(query, function (error, experiences) {
        response.render("experiences", {
            title: "Experiences",
            style: "experiences.css",
            experiences: experiences,
        });
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

// POST CONTACT
app.post("/contact", function (request, response) {
    const email = request.body.email;
    const message = request.body.message;

    const query = `INSERT INTO contact (email, message, response) VALUES (?, ?, ?)`;
    const values = [email, message, "The response to Your question will be available here soon."];

    database.run(query, values, function (error) {
        response.redirect("/contact");
    });
});

// POST NEWS
app.post("/news", function (request, response) {
    const date = request.body.date;
    const title = request.body.title;
    const post = request.body.post;
    // const image = request.body.image;

    const query = `INSERT INTO news (date, title, post) VALUES (?, ?, ?)`;
    const values = [date, title, post];

    database.run(query, values, function (error) {
        response.redirect("/news");
    });
});

// POST EXPERIENCES
app.post("/experiences", function (request, response) {
    const name = request.body.name;
    const link = request.body.link;
    const experience = request.body.experience;

    const query = `INSERT INTO experiences (name, link, experience) VALUES (?, ?, ?)`;
    const values = [name, link, experience];

    database.run(query, values, function (error) {
        response.redirect("/experiences");
    });
});

// LOG IN
app.post("/admin", function (request, response) {
    const username = request.body.username;
    const password = request.body.password;

    if (username == adminUsername && password == adminPassword) {
        request.session.isLoggedIn = true;
        // document.getElementById("navigationAdmin").style.visibility = "visible";
        // document.getElementById("navigationAdmin").style.height = "auto";
        response.redirect("/");
    } else {
        response.render("admin", {
            failedToLogin: true,
            title: "Admin",
            style: "admin.css",
        });
    }
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8000);
});
