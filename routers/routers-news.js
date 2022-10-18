const express = require("express");
const database = require("../database/database-news.js");
const multer = require("multer");
const fs = require("node:fs");

const storage = multer.diskStorage({
    destination(request, file, cb) {
        cb(null, ".public/uploads");
    },
    filename(request, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
});

const router = express.Router();

router.get("/", (request, response) => {
    const errorMessagesInternal = [];

    database.getNewsAll((error, news) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
        }

        response.render("news", {
            webTitle: "News",
            webStyle: "news.css",
            errorMessagesInternal,
            news,
        });
    });
});

router.get("/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getNewsID(id, (error, newsOne) => {
        if (error) {
            errorMessagesInternal.push("EXISTING ENTRY COULDN'T BE RETRIEVED.");
        }

        response.render("news-entry", {
            webTitle: "News nr " + id,
            webStyle: "news-entry.css",
            errorMessagesInternal,
            newsOne,
        });
    });
});

router.post("/", upload.single("image"), (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const date = request.body.date;
    const title = request.body.title;
    const post = request.body.post;

    if (request.file) {
        const imagePath = "./public/uploads/" + request.file.filename;
        if (request.file.size > 5000000) {
            errorMessagesExternal.push("AN IMAGE CANNOT BE LARGER THAN 5MB.");
            fs.unlink(imagePath, (error) => {
                if (error) {
                    errorMessagesInternal.push("AN IMAGE COULDN'T BE UNLINKED.");
                }
            });
        } else if (request.file.mimetype == "image/png" || request.file.mimetype == "image/jpg" || request.file.mimetype == "image/jpeg") {
            var image = request.file.filename;
        } else {
            errorMessagesExternal.push("ONLY .PNG, .JPG AND .JPEG FORMATS ARE ALLOWED.");
            fs.unlink(imagePath, (error) => {
                if (error) {
                    errorMessagesInternal.push("AN IMAGE COULDN'T BE UNLINKED.");
                }
            });
        }
    } else {
        errorMessagesExternal.push("AN IMAGE NEEDS TO BE SELECTED.");
    }
    if (date.length == 0) {
        errorMessagesExternal.push("A DATE CANNOT BE EMPTY.");
    }
    if (title.length == 0) {
        errorMessagesExternal.push("A TITLE CANNOT BE EMPTY.");
    } else if (title.length < 10) {
        errorMessagesExternal.push("A TITLE CANNOT BE LESS THAN 10 CHARACTERS.");
    } else if (title.length > 100) {
        errorMessagesExternal.push("A TITLE CANNOT BE MORE THAN 100 CHARACTERS.");
    }
    if (post.length == 0) {
        errorMessagesExternal.push("A POST CANNOT BE EMPTY.");
    } else if (post.length < 100) {
        errorMessagesExternal.push("A POST CANNOT BE LESS THAN 100 CHARACTERS.");
    } else if (post.length > 1000) {
        errorMessagesExternal.push("A TITLE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.createNews(date, title, post, image, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE PUBLISHED.");
            }

            database.getNewsAll((error, news) => {
                if (error) {
                    errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
                }

                if (errorMessagesInternal.length === 0) {
                    // VIEW 1: RETRIEVED & PUBLISHED — REDIRECT
                    response.redirect("/news");
                } else if (errorMessagesInternal.length === 1 && errorMessagesInternal[0] === "EXISTING ENTRIES COULDN'T BE RETRIEVED.") {
                    // VIEW 2: COULDN'T RETRIEVE & PUBLISHED
                    response.render("news", {
                        webTitle: "News",
                        webStyle: "news.css",
                        errorMessagesInternal,
                    });
                } else {
                    // VIEW 3: COULDN'T RETRIEVE & COULDN'T PUBLISH
                    // VIEW 4: RETRIEVED & COULDN'T PUBLISH
                    response.render("news", {
                        webTitle: "News",
                        webStyle: "news.css",
                        errorMessagesInternal,
                        news,
                        date,
                        title,
                        post,
                    });
                }
            });
        });
    } else {
        database.getNewsAll((error, news) => {
            if (error) {
                errorMessagesInternal.push("EXISTING ENTRIES COULDN'T BE RETRIEVED.");
            }

            response.render("news", {
                webTitle: "News",
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

router.get("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getNewsID(id, (error, newsOne) => {
        if (error) {
            errorMessagesInternal.push("EDIT FORM COULDN'T BE RETRIEVED.");
        }

        if (request.session.isLoggedIn) {
            response.render("content-edit", {
                webTitle: "Edit News",
                webStyle: "content-edit.css",
                errorMessagesInternal,
                newsOne,
            });
        } else {
            response.redirect("/admin");
        }
    });
});

router.post("/edit/:id", (request, response) => {
    const errorMessagesInternal = [];
    const errorMessagesExternal = [];

    const newDate = request.body.date;
    const newTitle = request.body.title;
    const newPost = request.body.post;
    const id = request.params.id;

    if (newDate.length == 0) {
        errorMessagesExternal.push("NEW DATE CANNOT BE EMPTY.");
    }
    if (newTitle.length == 0) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE EMPTY.");
    } else if (newTitle.length < 10) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE LESS THAN 10 CHARACTERS.");
    } else if (newTitle.length > 100) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE MORE THAN 100 CHARACTERS.");
    }
    if (newPost.length == 0) {
        errorMessagesExternal.push("NEW POST CANNOT BE EMPTY.");
    } else if (newPost.length < 100) {
        errorMessagesExternal.push("NEW POST CANNOT BE LESS THAN 100 CHARACTERS.");
    } else if (newPost.length > 1000) {
        errorMessagesExternal.push("NEW TITLE CANNOT BE MORE THAN 1000 CHARACTERS.");
    }

    if (errorMessagesExternal.length == 0) {
        database.editNews(newDate, newTitle, newPost, id, (error) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");

                response.render("content-edit", {
                    webTitle: "ERROR",
                    webStyle: "content-edit.css",
                    errorMessagesInternal,
                });
            } else {
                response.redirect("/news/" + id);
            }
        });
    } else {
        database.getNewsID(id, (error, newsOne) => {
            if (error) {
                errorMessagesInternal.push("YOUR ENTRY COULDN'T BE UPDATED.");
            }

            response.render("content-edit", {
                webTitle: "Edit News",
                webStyle: "content-edit.css",
                errorMessagesExternal,
                errorMessagesInternal,
                newsOne,
            });
        });
    }
});

router.post("/delete/:id", (request, response) => {
    const errorMessagesInternal = [];

    const id = request.params.id;

    database.getImageName(id, (error, imageName) => {
        if (error) {
            errorMessagesInternal.push("IMAGE NAME COULDN'T BE RETRIEVED.");
        } else {
            database.deleteNews(id, (error) => {
                if (error) {
                    errorMessagesInternal.push("YOUR ENTRY COULDN'T BE DELETED.");

                    response.render("news-entry", {
                        webTitle: "ERROR",
                        webStyle: "news-entry.css",
                        errorMessagesInternal,
                    });
                } else {
                    const imagePath = "./public/uploads/" + imageName.image;
                    fs.unlink(imagePath, (error) => {
                        if (error) {
                            errorMessagesInternal.push("AN IMAGE COULDN'T BE UNLINKED.");
                        }
                    });

                    database.updateSequenceNews((error) => {
                        if (error) {
                            errorMessagesInternal.push("TABLE'S AUTOINCREMENT COULDN'T BE RESET.");
                        } else {
                            response.redirect("/news");
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
