const express = require("express");
const database = require("../database.js");

const router = express.Router();

router.get("/", (request, response) => {
    const errorMessagesInternal = [];

    database.getContactAll((error, contact) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED");
        }

        response.render("contact", {
            webTitle: "Contact",
            webStyle: "contact.css",
            errorMessagesInternal,
            contact,
        });
    });
});

router.get("/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getContactID(id, (error, contactOne) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        response.render("contact-entry", {
            webTitle: "FAQ nr " + id,
            webStyle: "contact-entry.css",
            errorMessagesInternal,
            contactOne,
        });
    });
});

router.post("/", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const message = request.body.message;
    const email = request.body.email;
    const locationOfAt = email.indexOf("@");
    const frequencyOfAt = email.split("@").length - 1;

    // The e-mail validation and constraints (if-statements) have been taken from the following website: https://insidethediv.com/email-validation-on-javascript. The following solution has been introduced to increase the security on the server side. I am not the owner of the following solution and, therefore, own no copyrights — Wiktoria Drezner, 07/10/2022

    if (email == "") {
        errorMessagesExternal.push("AN EMAIL CANNOT BE EMPTY.");
    } else if (email.length > 254) {
        errorMessagesExternal.push("AN EMAIL CANNOT BE MORE THAN 254 CHARACTERS.");
    } else if (email.length < 6) {
        errorMessagesExternal.push("AN EMAIL CANNOT BE LESS THAN 6 CHARACTERS.");
    } else if (locationOfAt < 0) {
        errorMessagesExternal.push("AN EMAIL NEEDS TO INCLUDE ONE @ SIGN.");
    } else if (frequencyOfAt > 1) {
        errorMessagesExternal.push("AN EMAIL CANNOT INCLUDE MULTIPLE @ SIGNS.");
    }
    if (message == "") {
        errorMessagesExternal.push("A MESSAGE CANNOT BE EMPTY.");
    } else if (message.length > 300) {
        errorMessagesExternal.push("A MESSAGE CANNOT BE MORE THAN 300 CHARACTERS.");
    } else if (message.length < 20) {
        errorMessagesExternal.push("A MESSAGE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.createContact(email, message, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE SUBMITTED.");
            }

            database.getContactAll((error, contact) => {
                if (error) {
                    errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length === 0) {
                    // VIEW 1: RETRIEVED & SUBMITTED — REDIRECT
                    response.redirect("/contact");
                } else if (errorMessagesInternal.length === 1 && errorMessagesInternal[0] === "EXISTING ENTRIES COULDN'T BE RETRIEVED.") {
                    // VIEW 2: COULDN'T RETRIEVE & SUBMITTED
                    response.render("contact", {
                        webTitle: "Contact",
                        webStyle: "contact.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW 3: COULDN'T RETRIEVE & COULDN'T SUBMIT
                    // VIEW 4: RETRIEVED & COULDN'T SUBMIT
                    response.render("contact", {
                        webTitle: "Contact",
                        webStyle: "contact.css",
                        errorMessagesInternal,
                        contact,
                        email,
                        message,
                    });
                }
            });
        });
    } else {
        database.getContactAll((error, contact) => {
            if (error) {
                errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            response.render("contact", {
                webTitle: "Contact",
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

router.get("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getContactID(id, (error, contactOne) => {
        if (error) {
            errorMessagesInternal.push("CONTACT FORM COULDN'T BE RETRIEVED.");
        }

        if (request.session.isLoggedIn) {
            response.render("content-edit.hbs", {
                webTitle: "Edit Contact",
                webStyle: "content-edit.css",
                errorMessagesInternal,
                contactOne,
            });
        } else {
            response.redirect("/admin");
        }
    });
});

router.post("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const newMessage = request.body.message;
    const newResponse = request.body.response;
    const id = request.params.id;

    if (newMessage == "") {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE EMPTY.");
    } else if (newMessage.length > 300) {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE MORE THAN 300 CHARACTERS.");
    } else if (newMessage.length < 20) {
        errorMessagesExternal.push("NEW MESSAGE CANNOT BE LESS THAN 20 CHARACTERS.");
    }
    if (newResponse == "") {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE EMPTY.");
    } else if (newResponse.length > 1000) {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE MORE THAN 1000 CHARACTERS.");
    } else if (newResponse.length < 20) {
        errorMessagesExternal.push("NEW RESPONSE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.editContact(newMessage, newResponse, id, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");

                response.render("content-edit", {
                    webTitle: "ERROR",
                    webStyle: "content-edit.css",
                    errorMessagesInternal,
                });
            } else {
                response.redirect("/contact/" + id);
            }
        });
    } else {
        database.getContactID(id, (error, contactOne) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");
            }

            response.render("content-edit.hbs", {
                webTitle: "Edit News",
                webStyle: "content-edit.css",
                errorMessagesExternal,
                errorMessagesInternal,
                contactOne,
            });
        });
    }
});

router.post("/delete/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.deleteContact(id, (error) => {
        if (error) {
            errorMessagesInternal.push("YOUR ENTRY COULDN'T BE DELETED.");

            response.render("contact-entry", {
                webTitle: "ERROR",
                webStyle: "news-entry.css",
                errorMessagesInternal,
            });
        } else {
            database.updateSequenceContact((error) => {
                if (error) {
                    errorMessagesInternal.push("TABLE'S AUTOINCREMENT COULDN'T BE RESET.");
                } else {
                    response.redirect("/contact");
                }
            });
        }
    });
});

module.exports = router;
