const express = require("express");
const expressHandlebars = require("express-handlebars");
const data = require("./data");
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
    });
});
app.get("/experiences", (request, response) => {
    response.render("experiences", {
        title: "Experiences",
        style: "experiences.css",
    });
});
app.get("/contact", (request, response) => {
    response.render("contact", {
        title: "Contact",
        style: "contact.css",
        contact: data.contact,
    });
});
app.get("/faq", (request, response) => {
    response.render("faq", {
        title: "FAQ",
        style: "faq.css",
    });
});

// Get CONTACT
app.post("/contact", function (request, response) {
    const email = request.body.email;
    const message = request.body.message;

    data.contact.push({
        id: data.contact.at(-1).id + 1,
        email: email,
        message: message,
    });

    response.redirect("/faq");
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8000);
});
