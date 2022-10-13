const express = require("express");
const database = require("../database/database-search.js");

const router = express.Router();

router.get("/", (request, response) => {
    response.render("search", {
        webTitle: "Search",
        webStyle: "search.css",
    });
});

router.get("/results", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const valueSearched = request.query.valueSearched;

    if (valueSearched.length == 0 || valueSearched.trim().length == 0) {
        errorMessagesExternal.push("SEARCHED VALUE CANNOT BE EMPTY.");
    }

    if (errorMessagesExternal.length == 0) {
        database.searchContact(valueSearched, (error, contact) => {
            if (error) {
                errorMessagesInternal.push("VALUES COULDN'T BE RETRIEVED.");

                response.render("search", {
                    webTitle: "ERROR",
                    webStyle: "search.css",
                    errorMessagesInternal,
                });
            } else {
                database.searchExperiences(valueSearched, (error, experiences) => {
                    if (error) {
                        errorMessagesInternal.push("VALUES COULDN'T BE RETRIEVED.");

                        response.render("search", {
                            webTitle: "ERROR",
                            webStyle: "search.css",
                            errorMessagesInternal,
                        });
                    } else {
                        database.searchNews(valueSearched, (error, news) => {
                            if (error) {
                                errorMessagesInternal.push("VALUES COULDN'T BE RETRIEVED.");

                                response.render("search", {
                                    webTitle: "ERROR",
                                    webStyle: "search.css",
                                    errorMessagesInternal,
                                });
                            } else {
                                response.render("search", {
                                    webTitle: "Search Results",
                                    webStyle: "search.css",
                                    valueSearched,
                                    contact,
                                    experiences,
                                    news,
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        response.render("search", {
            webTitle: "Search",
            webStyle: "search.css",
            errorMessagesExternal,
            valueSearched,
        });
    }
});

module.exports = router;
