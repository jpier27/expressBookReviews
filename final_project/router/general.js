const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Username must be at least 3 characters long and contain only letters, numbers, and underscores" });
    }

    // Check if user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });

});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  //Write your code here
//   return res.status(200).json(books);
    try {
        const getBooksAsync = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(books);
                }, 1000);
            });
        };

        const booksList = await getBooksAsync();
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    // const book = books[isbn];

    // if (!book) {
    //     return res.status(404).json({ message: "Book not found" });
    // }

    // return res.status(200).json(book);
    const getBookByISBN = new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 1000);
    });

    getBookByISBN
        .then(book => {
            return res.status(200).json(book);
        })
        .catch(error => {
            return res.status(404).json({ message: error.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
    const author = req.params.author;
     const getBooksByAuthor = (callback) => {
        setTimeout(() => {
            const matchingBooks = [];
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
                    matchingBooks.push({
                        isbn: isbn,
                        ...books[isbn]
                    });
                }
            }
            if (matchingBooks.length > 0) {
                callback(null, {
                    data: { books: matchingBooks },
                    status: 200
                });
            } else {
                callback({
                    response: {
                        status: 404,
                        data: { message: "No books found by this author" }
                    }
                }, null);
            }
        }, 1000);
    };
    getBooksByAuthor((error, response) => {
        if (error) {
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(200).json(response.data);
    });

    // const matchingBooks = [];
    // for (let isbn in books) {
    //     if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
    //         matchingBooks.push({
    //             isbn: isbn,
    //             ...books[isbn]
    //         });
    //     }
    // }

    // if (matchingBooks.length === 0) {
    //     return res.status(404).json({ message: "No books found by this author" });
    // }

    // return res.status(200).json({ books: matchingBooks });  
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title;
    const fetchBooksByTitle = async () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const matchingBooks = [];
                for (let isbn in books) {
                    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                        matchingBooks.push({
                            isbn: isbn,
                            ...books[isbn]
                        });
                    }
                }
                if (matchingBooks.length > 0) {
                    resolve({
                        data: { books: matchingBooks },
                        status: 200
                    });
                } else {
                    reject({
                        response: {
                            status: 404,
                            data: { message: "No books found with this title" }
                        }
                    });
                }
            }, 1000);
        });
    };

    const response = await fetchBooksByTitle();
    return res.status(200).json(response.data);
} catch (error) {
    return res.status(error.response.status).json(error.response.data);
}
//   const title = req.params.title;
//     const matchingBooks = [];

//     for (let isbn in books) {
//         if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
//             matchingBooks.push({
//                 isbn: isbn,
//                 ...books[isbn]
//             });
//         }
//     }

//     if (matchingBooks.length === 0) {
//         return res.status(404).json({ message: "No books found with this title" });
//     }

//     return res.status(200).json({ books: matchingBooks });

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ reviews: book.reviews });
});

module.exports.general = public_users;
