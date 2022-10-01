const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");

const adminUsername = "123";
const adminPassword = "123";

// const adminUsername = "dreznerwiktoria";
// const adminPassword = "grandYearPass2022()123admin";

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

app.use((request, response, next) => {
    response.locals.session = request.session;
    next();
});

// ROUTING
app.get("/", (request, response) => {
    response.render("index", {
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
    database.all(query, (error, news) => {
        const errorMessages = [];

        if (error) {
            errorMessages.push("INTERNAL SERVER ERROR");
        }

        response.render("news", {
            title: "News",
            style: "news.css",
            errorMessages,
            news,
        });
    });
});
app.get("/experiences", (request, response) => {
    const query = `SELECT * FROM experiences`;
    database.all(query, (error, experiences) => {
        const errorMessages = [];

        if (error) {
            errorMessages.push("INTERNAL SERVER ERROR");
        }

        response.render("experiences", {
            title: "Experiences",
            style: "experiences.css",
            errorMessages,
            experiences,
        });
    });
});
app.get("/contact", (request, response) => {
    const query = `SELECT * FROM contact`;
    database.all(query, (error, contact) => {
        const errorMessages = [];

        if (error) {
            errorMessages.push("INTERNAL SERVER ERROR");
        }

        response.render("contact", {
            title: "Contact",
            style: "contact.css",
            errorMessages,
            contact,
        });
    });
});

// POST CONTACT
app.post("/contact", (request, response) => {
    const errorMessages = [];

    const email = request.body.email;
    const message = request.body.message;

    // CHECK IF ERROR
    if (email == "") {
        errorMessages.push("An EMAIL cannot be empty");
    }
    if (message == "") {
        errorMessages.push("A MESSAGE cannot be empty");
    }

    // IF NO ERROR
    if (errorMessages.length == 0) {
        const query = `INSERT INTO contact (email, message, response) VALUES (?, ?, ?)`;
        const values = [email, message, "The response to Your question will be available here soon."];

        database.run(query, values, (error) => {
            if (error) {
                errorMessages.push("INTERNAL SEVER ERROR");
                const query = `SELECT * FROM contact`;
                database.all(query, (error, contact) => {
                    response.render("contact", {
                        title: "Contact",
                        style: "contact.css",
                        errorMessages,
                        contact,
                        email,
                        message,
                    });
                });
            } else {
                response.redirect("/contact");
            }
        });
    } // IF ERROR
    else {
        const query = `SELECT * FROM contact`;
        database.all(query, (error, contact) => {
            response.render("contact", {
                title: "Contact",
                style: "contact.css",
                contact,
                email,
                message,
            });
            console.log(errorMessages.length);
        });
    }
});

// POST NEWS
app.post("/news", (request, response) => {
    const errorMessages = [];

    const date = request.body.date;
    const title = request.body.title;
    const post = request.body.post;
    // const image = request.body.image;

    // CHECK IF ERROR
    if (date == "") {
        errorMessages.push("A DATE cannot be empty");
    }
    if (title == "") {
        errorMessages.push("A TITLE cannot be empty");
    }
    if (post == "") {
        errorMessages.push("A POST cannot be empty");
    }

    // IF NO ERROR
    if (errorMessages.length == 0) {
        const query = `INSERT INTO news (date, title, post) VALUES (?, ?, ?)`;
        const values = [date, title, post];

        database.run(query, values, (error) => {
            if (error) {
                errorMessages.push("INTERNAL SEVER ERROR");
                const query = `SELECT * FROM news`;
                database.all(query, (error, news) => {
                    response.render("news", {
                        title: "News",
                        style: "news.css",
                        errorMessages,
                        news,
                        date,
                        title,
                        post,
                    });
                });
            } else {
                response.redirect("/news");
            }
        });
    } // IF ERROR
    else {
        const query = `SELECT * FROM news`;
        database.all(query, (error, news) => {
            response.render("news", {
                title: "News",
                style: "news.css",
                errorMessages,
                news,
                date,
                title,
                post,
            });
        });
    }
});

// POST EXPERIENCES
app.post("/experiences", (request, response) => {
    const errorMessages = [];

    const name = request.body.name;
    const link = request.body.link;
    const experience = request.body.experience;

    // CHECK IF ERROR
    if (name == "") {
        errorMessages.push("A NAME cannot be empty");
    }
    if (link == "") {
        errorMessages.push("A LINK cannot be empty");
    }
    if (experience == "") {
        errorMessages.push("An EXPERIENCE cannot be empty");
    }

    // IF NO ERROR
    if (errorMessages.length == 0) {
        const query = `INSERT INTO experiences (name, link, experience) VALUES (?, ?, ?)`;
        const values = [name, link, experience];

        database.run(query, values, (error) => {
            if (error) {
                errorMessages.push("INTERNAL SEVER ERROR");
                const query = `SELECT * FROM experiences`;
                database.all(query, (error, experiences) => {
                    response.render("experiences", {
                        title: "Experiences",
                        style: "experiences.css",
                        errorMessages,
                        experiences,
                        name,
                        link,
                        experience,
                    });
                });
            } else {
                response.redirect("/experiences");
            }
        });
    } // IF ERROR
    else {
        const query = `SELECT * FROM experiences`;
        database.all(query, (error, experiences) => {
            response.render("experiences", {
                title: "Experiences",
                style: "experiences.css",
                errorMessages,
                experiences,
                name,
                link,
                experience,
            });
        });
    }
});

// LOG IN
app.post("/admin", (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    if (username == adminUsername && password == adminPassword) {
        // SESSION IF LOGGED IN
        request.session.isLoggedIn = true;
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
