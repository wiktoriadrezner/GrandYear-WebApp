const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");

const adminUsername = "123";
const adminPassword = "123";

// const adminUsername = "dreznerwiktoria";
// const adminPassword = "grandYearPass2022()123admin";

const database = new sqlite3.Database("grand-year-database.db");
// DATABASE: TABLE — NEWS
database.run(`
	CREATE TABLE IF NOT EXISTS news (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        post TEXT
	);
`);
// DATABASE: TABLE — COMMENTS
database.run(`
	CREATE TABLE IF NOT EXISTS comments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        news_id INTEGER,
        email TEXT,
		comment TEXT,
        FOREIGN KEY (news_id) REFERENCES news(id)
	);
`);
// DATABASE: TABLE — EXPERIENCES
database.run(`
	CREATE TABLE IF NOT EXISTS experiences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        link TEXT,
        experience TEXT
	);
`);
// DATABASE: TABLE — CONTACT
database.run(`
	CREATE TABLE IF NOT EXISTS contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT,
		message TEXT,
        response TEXT
	);
`);

const app = express();

app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false,
    })
);

// HANDLEBARS VIEW
app.engine(
    "hbs",
    expressHandlebars.engine({
        defaultLayout: "main.hbs",
    })
);
app.set("view engine", "hbs");

// APP SESSION
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

// INDEX — GET
app.get("/", (request, response) => {
    response.render("index", {
        webTitle: "Grand Year",
        webStyle: "index.css",
    });
});

// ADMIN — GET
app.get("/admin", (request, response) => {
    response.render("admin", {
        webTitle: "Admin",
        webStyle: "admin.css",
    });
});

// ADMIN — LOG IN
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
            webTitle: "Admin",
            webStyle: "admin.css",
        });
    }
});

// MISSION — GET
app.get("/mission", (request, response) => {
    response.render("mission", {
        webTitle: "Our Mission",
        webStyle: "mission.css",
    });
});

// OPPORTUNITIES — GET
app.get("/opportunities", (request, response) => {
    response.render("opportunities", {
        webTitle: "Opportunities",
        webStyle: "opportunities.css",
    });
});

// NEWS — GET
app.get("/news", (request, response) => {
    const query = `SELECT * FROM news`;
    database.all(query, (error, news) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("news", {
                webTitle: "ERROR",
                webStyle: "news.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("news", {
                webTitle: "News",
                webStyle: "news.css",
                news,
            });
        }
    });
});

// NEWS — GET ID
app.get("/news/:id", (request, response) => {
    const id = request.params.id;
    const query = `SELECT * FROM news WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, news) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRY COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("news-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("news-entry", {
                webTitle: "News " + news.date,
                webStyle: "news-entry.css",
                news,
            });
        }
    });
});

// NEWS – POST COMMENT
app.post("/news/:id", (request, response) => {
    const errorMessagesExternal = [];

    const email = request.body.email;
    const comment = request.body.comment;

    // CHECK IF EXTERNAL ERROR
    if (email == "") {
        errorMessagesExternal.push("AN EMAIL CANNOT BE EMPTY.");
    }
    if (comment == "") {
        errorMessagesExternal.push("A COMMENT CANNOT BE EMPTY.");
    }
    if (comment.length > 300) {
        errorMessagesExternal.push("A COMMENT CANNOT BE MORE THAN 300 CHARACTERS.");
    }
    if (comment.length < 20) {
        errorMessagesExternal.push("A COMMENT CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `INSERT INTO comments (email, comment) VALUES (?, ?)`;
        const values = [email, comment];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE PUBLISHED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE SUBMITTED.");
            }

            const query = `SELECT * FROM comments`;

            database.all(query, (error, comments) => {
                if (error) {
                    // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                    errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length) {
                    // VIEW: INTERNAL ERROR
                    response.render("news-entry", {
                        webTitle: "ERR0R",
                        webStyle: "news-entry.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW: NO ERROR
                    response.render("news-entry", {
                        webTitle: "News",
                        webStyle: "news-entry.css",
                        comments,
                    });
                }
            });
        });
    } else {
        const query = `SELECT * FROM comments`;
        database.all(query, (error, comments) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("news-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesExternal,
                errorMessagesInternal,
                comments,
                email,
                comment,
            });
        });
    }
});

// NEWS — POST
app.post("/news", (request, response) => {
    const errorMessagesExternal = [];

    const date = request.body.date;
    const title = request.body.title;
    const post = request.body.post;
    // const image = request.body.image;

    // CHECK IF EXTERNAL ERROR
    if (date == "") {
        errorMessagesExternal.push("A DATE CANNOT BE EMPTY.");
    }
    if (title == "") {
        errorMessagesExternal.push("A TITLE CANNOT BE EMPTY.");
    }
    if (title.length < 10) {
        errorMessagesExternal.push("A TITLE CANNOT BE LESS THAN 10 CHARACTERS.");
    }
    if (title.length > 100) {
        errorMessagesExternal.push("A TITLE CANNOT BE MORE THAN 100 CHARACTERS.");
    }
    if (post == "") {
        errorMessagesExternal.push("A POST CANNOT BE EMPTY.");
    }
    if (post.length < 100) {
        errorMessagesExternal.push("A POST CANNOT BE LESS THAN 100 CHARACTERS.");
    }
    if (post.length > 1000) {
        errorMessagesExternal.push("A TITLE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `INSERT INTO news (date, title, post) VALUES (?, ?, ?)`;
        const values = [date, title, post];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE PUBLISHED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE PUBLISHED.");
            }

            const query = `SELECT * FROM news`;

            database.all(query, (error, news) => {
                if (error) {
                    // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                    errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length) {
                    // VIEW: INTERNAL ERROR
                    response.render("news", {
                        webTitle: "ERR0R",
                        webStyle: "news.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW: NO ERROR
                    response.render("news", {
                        webTitle: "News",
                        webStyle: "news.css",
                        news,
                    });
                }
            });
        });
    } else {
        const query = `SELECT * FROM news`;
        database.all(query, (error, news) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("news", {
                webTitle: "ERROR",
                webStyle: "news.css",
                errorMessagesExternal,
                errorMessagesInternal,
                news,
                date,
                title,
                post,
            });
        });
    }
});

// NEWS — EDIT
app.get("/news/edit/:id", (request, response) => {
    const id = request.params.id;
    const query = `SELECT * FROM news WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, newsOne) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EDIT FORM COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EDIT FORM COULDN'T BE RETRIEVED.");

            // VIEW: INTERNAL ERROR
            response.render("news-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("content-edit", {
                webTitle: "Edit News",
                webStyle: "content-edit.css",
                newsOne,
            });
        }
    });
});

// NEWS — POST EDITED
app.post("/news/edit/:id", (request, response) => {
    const errorMessagesExternal = [];

    const id = request.params.id;
    const newDate = request.body.date;
    const newTitle = request.body.title;
    const newPost = request.body.post;

    // CHECK IF EXTERNAL ERROR
    if (newDate == "") {
        errorMessagesExternal.push("NEW DATE CANNOT BE EMPTY.");
    }
    if (newTitle == "") {
        errorMessagesExternal.push("NEW TITLE CANNOT BE EMPTY.");
    }
    if (newTitle.length < 10) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE LESS THAN 10 CHARACTERS.");
    }
    if (newTitle.length > 100) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE MORE THAN 100 CHARACTERS.");
    }
    if (newPost == "") {
        errorMessagesExternal.push("NEW POST CANNOT BE EMPTY.");
    }
    if (newPost.length < 100) {
        errorMessagesExternal.push("NEW POST CANNOT BE LESS THAN 100 CHARACTERS.");
    }
    if (newPost.length > 1000) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `UPDATE news SET date = ?, title = ?, post = ? WHERE id = ?`;
        const values = [newDate, newTitle, newPost, id];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE UPDATED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE UPDATED.");

                // VIEW: INTERNAL ERROR
                response.render("content-edit", {
                    webTitle: "ERROR",
                    webStyle: "content-edit.css",
                    errorMessagesInternal,
                });
            } else {
                // VIEW: NO ERROR — REDIRECT
                response.redirect("/news/" + id);
            }
        });
    } else {
        const id = request.params.id;
        const query = `SELECT * FROM news WHERE id = ?`;
        const values = [id];

        database.get(query, values, (error, newsOne) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE UPDATED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE UPDATED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("content-edit", {
                webTitle: "ERROR",
                webStyle: "content-edit.css",
                errorMessagesExternal,
                errorMessagesInternal,
                newsOne,
            });
        });
    }
});

// NEWS — DELETE
app.post("/news/delete/:id", (request, response) => {
    const id = request.params.id;
    const query = "DELETE FROM news WHERE id = ?";
    const values = [id];

    database.run(query, values, (error) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: YOUR ENTRY COULDN'T BE DELETED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE DELETED.");

            // VIEW: INTERNAL ERROR
            response.render("news-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesInternal,
            });
        } else {
            const query = `UPDATE sqlite_sequence SET seq = 0 WHERE name = "news"`;
            database.run(query, (error) => {
                const errorMessagesDatabase = [];

                if (error) {
                    // DATABASE ERROR: TABLE'S AUTOINCREMENT COULDN'T BE RESET
                    errorMessagesDatabase.push("INTERNAL SERVER ERROR. TABLE'S AUTOINCREMENT COULDN'T BE RESET.");
                }

                // VIEW: NO ERROR — REDIRECT
                response.redirect("/news");
            });
        }
    });
});

// EXPERIENCES — GET
app.get("/experiences", (request, response) => {
    const query = `SELECT * FROM experiences`;
    database.all(query, (error, experiences) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("experiences", {
                webTitle: "ERROR",
                webStyle: "experiences.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("experiences", {
                webTitle: "Experiences",
                webStyle: "experiences.css",
                experiences,
            });
        }
    });
});

// EXPERIENCES — GET ID
app.get("/experiences/:id", (request, response) => {
    const id = request.params.id;
    const query = `SELECT * FROM experiences WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, experiences) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRY COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("experiences-entry", {
                webTitle: "ERROR",
                webStyle: "experiences-entry.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("experiences-entry", {
                webTitle: "Experiences " + id,
                webStyle: "experiences-entry.css",
                experiences,
            });
        }
    });
});

// EXPERIENCES — POST
app.post("/experiences", (request, response) => {
    const errorMessagesExternal = [];

    const name = request.body.name;
    const email = request.body.email;
    const link = request.body.link;
    const experience = request.body.experience;

    // CHECK IF EXTERNAL ERROR
    if (name == "") {
        errorMessagesExternal.push("A NAME CANNOT BE EMPTY.");
    }
    if (name.length > 20) {
        errorMessagesExternal.push("A NAME CANNOT BE MORE THAN 20 CHARACTERS.");
    }
    if (email == "") {
        errorMessagesExternal.push("AN EMAIL CANNOT BE EMPTY.");
    }
    if (link == "") {
        errorMessagesExternal.push("A LINK CANNOT BE EMPTY.");
    }
    if (experience == "") {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE EMPTY.");
    }
    if (experience.length > 1000) {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }
    if (experience.length < 20) {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `INSERT INTO experiences (name, email, link, experience) VALUES (?, ?, ?, ?)`;
        const values = [name, email, link, experience];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE SHARED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE SHARED.");
            }

            const query = `SELECT * FROM experiences`;

            database.all(query, (error, experiences) => {
                if (error) {
                    // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                    errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length) {
                    // VIEW: INTERNAL ERROR
                    response.render("experiences", {
                        webTitle: "ERR0R",
                        webStyle: "experiences.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW: NO ERROR
                    response.render("experiences", {
                        webTitle: "Experiences",
                        webStyle: "experiences.css",
                        experiences,
                    });
                }
            });
        });
    } else {
        const query = `SELECT * FROM experiences`;
        database.all(query, (error, experiences) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("experiences", {
                webTitle: "ERROR",
                webStyle: "experiences.css",
                errorMessagesExternal,
                errorMessagesInternal,
                experiences,
                name,
                email,
                link,
                experience,
            });
        });
    }
});

// CONTACT — GET
app.get("/contact", (request, response) => {
    const query = `SELECT * FROM contact`;
    database.all(query, (error, contact) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("contact", {
                webTitle: "ERROR",
                webStyle: "contact.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("contact", {
                webTitle: "Contact",
                webStyle: "contact.css",
                contact,
            });
        }
    });
});

// CONTACT — GET ID
app.get("/contact/:id", (request, response) => {
    const id = request.params.id;
    const query = `SELECT * FROM contact WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, contact) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: EXISTING ENTRY COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        if (errorMessagesInternal.length) {
            // VIEW: INTERNAL ERROR
            response.render("contact-entry", {
                webTitle: "ERROR",
                webStyle: "contact-entry.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("contact-entry", {
                webTitle: "FAQ " + id,
                webStyle: "contact-entry.css",
                contact,
            });
        }
    });
});

// CONTACT — POST
app.post("/contact", (request, response) => {
    const errorMessagesExternal = [];

    const email = request.body.email;
    const message = request.body.message;

    // CHECK IF EXTERNAL ERROR
    if (email == "") {
        errorMessagesExternal.push("AN EMAIL CANNOT BE EMPTY.");
    }
    if (message == "") {
        errorMessagesExternal.push("A MESSAGE CANNOT BE EMPTY.");
    }
    if (message.length > 300) {
        errorMessagesExternal.push("A MESSAGE CANNOT BE MORE THAN 300 CHARACTERS.");
    }
    if (message.length < 20) {
        errorMessagesExternal.push("A MESSAGE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `INSERT INTO contact (email, message, response) VALUES (?, ?, ?)`;
        const values = [email, message, "The response to Your question will be available here soon."];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE PUBLISHED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE SUBMITTED.");
            }

            const query = `SELECT * FROM contact`;

            database.all(query, (error, contact) => {
                if (error) {
                    // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                    errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length) {
                    // VIEW: INTERNAL ERROR
                    response.render("contact", {
                        webTitle: "ERR0R",
                        webStyle: "contact.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW: NO ERROR
                    response.render("contact", {
                        webTitle: "Contact",
                        webStyle: "contact.css",
                        contact,
                    });
                }
            });
        });
    } else {
        const query = `SELECT * FROM contact`;
        database.all(query, (error, contact) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: EXISTING ENTRIES COULDN'T BE RETRIEVED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("contact", {
                webTitle: "ERROR",
                webStyle: "contact.css",
                errorMessagesExternal,
                errorMessagesInternal,
                contact,
                email,
                message,
            });
        });
    }
});

// CONTACT — EDIT
app.get("/contact/edit/:id", (request, response) => {
    const id = request.params.id;
    const query = `SELECT * FROM contact WHERE id = ?`;
    const values = [id];

    database.get(query, values, (error, contactOne) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: CONTACT FORM COULDN'T BE RETRIEVED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. CONTACT FORM COULDN'T BE RETRIEVED.");

            // VIEW: INTERNAL ERROR
            response.render("content-edit.hbs", {
                webTitle: "ERROR",
                webStyle: "content-edit.css",
                errorMessagesInternal,
            });
        } else {
            // VIEW: NO ERROR
            response.render("content-edit.hbs", {
                webTitle: "Edit Contact",
                webStyle: "content-edit.css",
                contactOne,
            });
        }
    });
});

// CONTACT — POST EDITED
app.post("/contact/edit/:id", (request, response) => {
    const errorMessagesExternal = [];

    const id = request.params.id;
    const newMessage = request.body.message;
    const newResponse = request.body.response;

    // CHECK IF EXTERNAL ERROR
    if (newMessage == "") {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE EMPTY.");
    }
    if (newMessage.length > 300) {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE MORE THAN 300 CHARACTERS.");
    }
    if (newMessage.length < 20) {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE LESS THAN 20 CHARACTERS.");
    }
    if (newResponse == "") {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE EMPTY.");
    }
    if (newResponse.length > 1000) {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }
    if (newResponse.length < 20) {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    // IF NO EXTERNAL ERROR
    if (errorMessagesExternal.length == 0) {
        const query = `UPDATE contact SET message = ?, response = ? WHERE id = ?`;
        const values = [newMessage, newResponse, id];

        database.run(query, values, (error) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE UPDATED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE UPDATED.");

                // VIEW: INTERNAL ERROR
                response.render("content-edit", {
                    webTitle: "ERROR",
                    webStyle: "content-edit.css",
                    errorMessagesInternal,
                });
            } else {
                // VIEW: NO ERROR — REDIRECT
                response.redirect("/contact/" + id);
            }
        });
    } else {
        const id = request.params.id;
        const query = `SELECT * FROM contact WHERE id = ?`;
        const values = [id];

        database.get(query, values, (error, contactOne) => {
            const errorMessagesInternal = [];

            if (error) {
                // INTERNAL ERROR: YOUR ENTRY COULDN'T BE UPDATED
                errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE UPDATED.");
            }

            // VIEW: INTERNAL/EXTERNAL ERROR
            response.render("content-edit.hbs", {
                webTitle: "ERROR",
                webStyle: "content-edit.css",
                errorMessagesExternal,
                errorMessagesInternal,
                contactOne,
            });
        });
    }
});

// CONTACT — DELETE
app.post("/contact/delete/:id", (request, response) => {
    const id = request.params.id;
    const query = `DELETE FROM contact WHERE id = ?`;
    const values = [id];

    database.run(query, values, (error) => {
        const errorMessagesInternal = [];

        if (error) {
            // INTERNAL ERROR: YOUR ENTRY COULDN'T BE DELETED
            errorMessagesInternal.push("INTERNAL SERVER ERROR. YOUR ENTRY COULDN'T BE DELETED.");

            // VIEW: INTERNAL ERROR
            response.render("contact-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesInternal,
            });
        } else {
            const query = `UPDATE sqlite_sequence SET seq = 0 WHERE name = "contact"`;
            database.run(query, (error) => {
                const errorMessagesDatabase = [];

                if (error) {
                    // DATABASE ERROR: TABLE'S AUTOINCREMENT COULDN'T BE RESET
                    errorMessagesDatabase.push("INTERNAL SERVER ERROR. TABLE'S AUTOINCREMENT COULDN'T BE RESET.");
                }

                // VIEW: NO ERROR — REDIRECT
                response.redirect("/contact");
            });
        }
    });
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8000);
});
