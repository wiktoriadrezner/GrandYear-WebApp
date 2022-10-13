const express = require("express");
const database = require("../database/database-experiences.js");

const router = express.Router();

router.get("/", (request, response) => {
    const errorMessagesInternal = [];

    database.getExperiencesAll((error, experiences) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED");
        }

        response.render("experiences", {
            webTitle: "Experiences",
            webStyle: "experiences.css",
            errorMessagesInternal,
            experiences,
        });
    });
});

router.get("/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getExperiencesID(id, (error, experiencesOne) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        response.render("experiences-entry", {
            webTitle: "Experience nr " + id,
            webStyle: "experiences-entry.css",
            errorMessagesInternal,
            experiencesOne,
        });
    });
});

router.post("/", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const name = request.body.name;
    const username = request.body.username;
    const experience = request.body.experience;
    const email = request.body.email;
    const locationOfAt = email.indexOf("@");
    const frequencyOfAt = email.split("@").length - 1;

    // The e-mail validation and constraints (if-statements) have been taken from the following website: https://insidethediv.com/email-validation-on-javascript. The following solution has been introduced to increase the security on the server side. I am not the owner of the following solution and, therefore, own no copyrights — Wiktoria Drezner, 07/10/2022

    if (name.length == 0) {
        errorMessagesExternal.push("A NAME CANNOT BE EMPTY.");
    } else if (name.length > 20) {
        errorMessagesExternal.push("A NAME CANNOT BE MORE THAN 20 CHARACTERS.");
    }
    if (email.length == 0) {
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
    if (username.length == 0) {
        errorMessagesExternal.push("A USERNAME CANNOT BE EMPTY.");
    } else if (username.length > 100) {
        errorMessagesExternal.push("A USERNAME CANNOT BE MORE THAN 100 CHARACTERS.");
    } else if (username.length < 3) {
        errorMessagesExternal.push("A USERNAME CANNOT BE LESS THAN 3 CHARACTERS.");
    }
    if (experience.length == 0) {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE EMPTY.");
    } else if (experience.length > 1000) {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE MORE THAN 1000 CHARACTERS.");
    } else if (experience.length < 20) {
        errorMessagesExternal.push("AN EXPERIENCE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.createExperiences(name, username, experience, email, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE SHARED.");
            }

            const query = `SELECT * FROM experiences`;

            database.getExperiencesAll((error, experiences) => {
                if (error) {
                    errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length === 0) {
                    // VIEW 1: RETRIEVED & SHARED — REDIRECT
                    response.redirect("/experiences");
                } else if (errorMessagesInternal.length === 1 && errorMessagesInternal[0] === "EXISTING ENTRIES COULDN'T BE RETRIEVED.") {
                    // VIEW 2: COULDN'T RETRIEVE & SHARED
                    response.render("experiences", {
                        webTitle: "Experiences",
                        webStyle: "experiences.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW 3: COULDN'T RETRIEVE & COULDN'T SHARE
                    // VIEW 4: RETRIEVED & COULDN'T SHARE
                    response.render("experiences", {
                        webTitle: "Experiences",
                        webStyle: "experiences.css",
                        errorMessagesInternal,
                        experiences,
                        name,
                        email,
                        username,
                        experience,
                    });
                }
            });
        });
    } else {
        database.getExperiencesAll((error, experiences) => {
            if (error) {
                errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            response.render("experiences", {
                webTitle: "Experiences",
                webStyle: "experiences.css",
                errorMessagesExternal,
                errorMessagesInternal,
                experiences,
                name,
                email,
                username,
                experience,
            });
        });
    }
});

router.get("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getExperiencesID(id, (error, experiencesOne) => {
        if (error) {
            errorMessagesInternal.push("CONTACT FORM COULDN'T BE RETRIEVED.");
        }

        if (request.session.isLoggedIn) {
            response.render("content-edit.hbs", {
                webTitle: "Edit Experience",
                webStyle: "content-edit.css",
                errorMessagesInternal,
                experiencesOne,
            });
        } else {
            response.redirect("/admin");
        }
    });
});

router.post("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const newName = request.body.name;
    const newUsername = request.body.username;
    const newExperience = request.body.experience;
    const id = request.params.id;

    if (newName.length == 0) {
        errorMessagesExternal.push("NEW NAME CANNOT BE EMPTY.");
    } else if (newName.length > 20) {
        errorMessagesExternal.push("NEW NAME CANNOT BE MORE THAN 20 CHARACTERS.");
    }
    if (newUsername.length == 0) {
        errorMessagesExternal.push("NEW USERNAME CANNOT BE EMPTY.");
    } else if (newUsername.length > 100) {
        errorMessagesExternal.push("NEW USERNAME CANNOT BE MORE THAN 100 CHARACTERS.");
    } else if (newUsername.length < 3) {
        errorMessagesExternal.push("NEW USERNAME CANNOT BE LESS THAN 3 CHARACTERS.");
    }
    if (newExperience.length == 0) {
        errorMessagesExternal.push("NEW EXPERIENCE CANNOT BE EMPTY.");
    } else if (newExperience.length > 1000) {
        errorMessagesExternal.push("NEW EXPERIENCE CANNOT BE MORE THAN 1000 CHARACTERS.");
    } else if (newExperience.length < 20) {
        errorMessagesExternal.push("NEW EXPERIENCE CANNOT BE LESS THAN 20 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.editExperiences(newName, newUsername, newExperience, id, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");

                response.render("content-edit", {
                    webTitle: "ERROR",
                    webStyle: "content-edit.css",
                    errorMessagesInternal,
                });
            } else {
                response.redirect("/experiences/" + id);
            }
        });
    } else {
        database.getExperiencesID(id, (error, experiencesOne) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");
            }

            response.render("content-edit.hbs", {
                webTitle: "Edit Experience",
                webStyle: "content-edit.css",
                errorMessagesExternal,
                errorMessagesInternal,
                experiencesOne,
            });
        });
    }
});

router.post("/delete/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.deleteExperiences(id, (error) => {
        if (error) {
            errorMessagesInternal.push("YOUR ENTRY COULDN'T BE DELETED.");

            response.render("experiences-entry", {
                webTitle: "ERROR",
                webStyle: "experiences-entry.css",
                errorMessagesInternal,
            });
        } else {
            database.updateSequenceExperiences((error) => {
                if (error) {
                    errorMessagesInternal.push("TABLE'S AUTOINCREMENT COULDN'T BE RESET.");
                } else {
                    response.redirect("/experiences");
                }
            });
        }
    });
});

module.exports = router;
