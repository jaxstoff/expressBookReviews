const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review_text = req.query.review; // review as query parameter
    const isbn = req.params.isbn + "";       // book isbn
    let token = req.session.authorization;
    let username = token["username"];   // username for review
    if (!review_text)
        return res.status(404).json({ message: `No review to add/update.` });
    
    if (isbn) {
        if (!books[isbn])
            return res.status(404).json({ message: `Unable to find a book with ISBN ${isbn}` });
        else {
            // if there's no review it gets added. If it exists it gets updated.
            books[isbn].reviews[username] = review_text;
            console.log(books[isbn].reviews[username]);
            // return whole book data or just that the review was added?
            return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated` });
         }
    } else {
        res.status(404).json({ message: `Missing parameter ISBN: ${isbn}` });
    }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn + "";       // book isbn
    let token = req.session.authorization;
    let username = token["username"];   // username for review
    if (isbn) {
        if (!books[isbn])
            return res.status(404).json({ message: `Unable to find a book with ISBN ${isbn}` });
        else {
            let filtered_review = books[isbn]["reviews"];

             }
    } else {
        res.status(404).json({ message: `Missing parameter ISBN: ${isbn}` });
    }


});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
