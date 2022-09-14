// const dummyData = require("./dummy-data");

const express = require("express");
const app = express();
const expressHandlebars = require("express-handlebars");

app.use(express.static("public"));

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
app.get("/contact", (request, response) => {
    response.render("contact", {
        title: "Contact",
        style: "contact.css",
    });
});
app.get("/news", (request, response) => {
    response.render("news", {
        title: "News",
        style: "news.css",
    });
});

app.listen(8080, () => {
    console.log("Server is starting at port", 8000);
});

// app.get("/", function (request, response) {
//     const model = {
//         humans: dummyData.humans,
//     };
//     response.render("show-all-humans.hbs", model);
// });

// app.use(express.static(path.join(__dirname, "/public")));
