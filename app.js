const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const SQLiteStore = require("connect-sqlite3")(expressSession);

const routerNews = require("./routers/routers-news.js");
const routerExperiences = require("./routers/routers-experiences.js");
const routerContact = require("./routers/routers-contact.js");

const adminUsername = "123";
const adminPassword = "123";

const app = express();

app.engine(
    "hbs",
    expressHandlebars.engine({
        defaultLayout: "main.hbs",
    })
);

app.use(express.static("public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    expressSession({
        secret: "oiakfgnunwgklyf",
        saveUninitialized: false,
        resave: false,
        rolling: true,
        cookie: {
            expires: 1800000,
        },
        store: new SQLiteStore({
            db: "userSessions.db",
        }),
    })
);

app.use((request, response, next) => {
    response.locals.session = request.session;
    next();
});

app.use("/news", routerNews);
app.use("/experiences", routerExperiences);
app.use("/contact", routerContact);

app.set("view engine", "hbs");

app.get("/", (request, response) => {
    response.render("index", {
        webTitle: "Grand Year",
        webStyle: "index.css",
    });
});

app.get("/mission", (request, response) => {
    response.render("mission", {
        webTitle: "Our Mission",
        webStyle: "mission.css",
    });
});

app.get("/opportunities", (request, response) => {
    response.render("opportunities", {
        webTitle: "Opportunities",
        webStyle: "opportunities.css",
    });
});

app.get("/admin", (request, response) => {
    response.render("admin", {
        webTitle: "Admin",
        webStyle: "admin.css",
    });
});

// ADMIN — LOG IN
app.post("/admin/login", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const enteredUsername = request.body.username;
    const enteredPassword = request.body.password;

    if (enteredUsername == adminUsername && enteredPassword == adminPassword) {
        request.session.regenerate((error) => {
            if (error) {
                errorMessagesInternal.push("SESSION COULDN'T BE REGENERATED.");

                response.render("admin", {
                    webTitle: "Admin",
                    webStyle: "admin.css",
                    errorMessagesInternal,
                });
            } else {
                request.session.save((error) => {
                    if (error) {
                        errorMessagesInternal.push("SESSION COULDN'T BE SAVED.");

                        response.render("admin", {
                            webTitle: "Admin",
                            webStyle: "admin.css",
                            errorMessagesInternal,
                        });
                    } else {
                        request.session.isLoggedIn = true;
                        response.redirect("/");
                    }
                });
            }
        });
    } else {
        errorMessagesExternal.push("YOU COULDN'T LOG IN. THE USERNAME/PASSWORD IS INCORRECT.");

        response.render("admin", {
            failedToLogin: true,
            webTitle: "Admin",
            webStyle: "admin.css",
            errorMessagesExternal,
        });
    }
});

// ADMIN — LOG OUT
app.post("/admin/logout", (request, response) => {
    const errorMessagesInternal = [];

    request.session.save((error) => {
        if (error) {
            errorMessagesInternal.push("SESSION COULDN'T BE SAVED.");

            response.render("admin", {
                webTitle: "Admin",
                webStyle: "admin.css",
                errorMessagesInternal,
            });
        } else {
            request.session.regenerate((error) => {
                if (error) {
                    errorMessagesInternal.push("SESSION COULDN'T BE REGENERATED.");

                    response.render("admin", {
                        webTitle: "Admin",
                        webStyle: "admin.css",
                        errorMessagesInternal,
                    });
                } else {
                    request.session.isLoggedIn = false;
                    response.redirect("/admin");
                }
            });
        }
    });
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8080);
});
