const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
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

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(201).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // get list of books in json
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // get a book based on ISBN (we don't have real ISBNs - this is just the key)
    const isbn = req.params.isbn+"";
    console.log(books[isbn]);
    if(!books[isbn])
        res.status(404).json({message: `No books found with ISBN ${isbn}`});
    else
        res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Get the author from the request URL (space in author name = %20)
  const author = req.params.author.toLowerCase();
  // Filter the books array to find books matching the extracted author parameter
  let books_array = Object.values(books).filter((book) => book.author.toLowerCase() === author);
  if(books_array.length == 0)
        res.status(404).json({message: `No books found by author`});
    else
        res.status(200).json(books_array);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   // Get the title from the request URL (space in title = %20)
  const title = req.params.title.toLowerCase().trim();

  // Filter the books array to find books matching the extracted author parameter
  // should really use a regex here
  let books_array = Object.values(books).filter((book) => book.title.toLowerCase() === title);
  
  if(books_array.length == 0)
        res.status(404).json({message: `No books found with title`});
    else
        res.status(200).json(books_array);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // get a book review based on ISBN  
    const isbn = req.params.isbn;
    let reviews =[];

    // no reviews?
    if(Object.keys(books[isbn]["reviews"]).length !== 0)
        reviews.push(books[isbn]["reviews"]);
    
    if(reviews.length == 0)
        res.status(404).json({message: `No reviews found for ISBN ${isbn}`});
    else
        res.status(200).json(reviews);

});

// Task 10 - List of Books using promises 
public_users.get('/task10',function (req, res) {
    // get list of books in json using promises
    let booklist = new Promise((resolve,reject) => {
        if (books)
            resolve(res.send(JSON.stringify(books,null,4)));
        else
            reject("No book data");
    })
    .then(() => console.log("Task 10 - Promises success"))
    .catch((error) => { 
        console.error(error); // "No book data or something else broke"
        res.status(404).json({ message: `${error}` });
      });
});

// Task 11 - Book details by ISBN using promises
public_users.get('/task11/isbn/:isbn', function (req, res) {
    // get a book based on ISBN 
    let thebook = new Promise((resolve, reject) => {
        const isbn = req.params.isbn + "";
        if (books[isbn])
            resolve(res.status(200).json(books[isbn]));
        else
            reject(`Book with ISBN ${isbn} not found`);
        })
        .then(() => console.log("Task 11 - Promises success"))
        .catch((error) => {
            console.error(error); // "No book found"
            res.status(404).json({ message: `${error}` });
        });
    });

// Task 12 - Book details by Author using promises
public_users.get('/task12/author/:author',function (req, res) {
    let booksbyauthor = new Promise((resolve,reject) => {
        const author = req.params.author.toLowerCase(); // case insensitive!    
        // Filter the books array to find books matching the extracted author parameter
        let books_array = Object.values(books).filter((book) => book.author.toLowerCase() === author);
        if(books_array.length > 0)
            resolve(res.status(200).json(books_array));
        else
            reject(`No books by ${author} found`);
    })
    .then(() => console.log("Task 12 - Promises success"))
    .catch((error) => { 
        console.error(error); 
        res.status(404).json({ message: `${error}` });
      });
  });

// Task 13 - Book details by Title using promises
public_users.get('/task13/title/:title',function (req, res) {
    let booksbytitle = new Promise((resolve,reject) => {
        const title = req.params.title.toLowerCase().trim();
        // Filter the books array to find books matching the extracted title parameter
        let books_array = Object.values(books).filter((book) => book.title.toLowerCase() === title);
        if(books_array.length > 0)
            resolve(res.status(200).json(books_array));
        else
            reject(`No books with title "${title}" found`);
    })
    .then(() => console.log("Task 13 - Promises success"))
    .catch((error) => { 
        console.error(error); 
        res.status(404).json({ message: `${error}` });
      });  
 });

module.exports.general = public_users;
