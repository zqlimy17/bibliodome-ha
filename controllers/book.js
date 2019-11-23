const express = require("express");
const Book = require("../models/books/Books");
const books = express.Router();
const Review = require("../models/reviews/Reviews");
const request = require("request");

books.get("/popular", async (req, res) => {
  let bookData = Book.find({})
    .sort({ rating: -1 })
    .limit(20);
  bookData.find({}, async (err, book) => {
    if (err) console.log(err.message);
    res.render("../views/books/popular.ejs", {
      book,
      currentUser: req.session.currentUser
    });
    console.log(req.session.currentUser);
  });
});

books.get("/results/:author", (req, res) => {
  let url = `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${req.params.author}`;
  //   console.log(url);
  request(url, { json: true }, (err, response, data) => {
    if (err) console.log(err.message);
    res.render("../views/books/searchresults.ejs", {
      data,
      currentUser: req.session.currentUser
    });
    // res.send(data);
  });
});

books.get("/:id/rate", async (req, res) => {
  if (req.session.currentUser) {
    Book.findOne({ id: req.params.id }, (err, foundBook) => {
      console.log("1. book is " + foundBook);
      if (err) {
      }
      if (foundBook) {
        Review.findOne(
          {
            reviewer: req.session.currentUser._id.toString(),
            book: foundBook._id.toString()
          },
          async (err, foundReview) => {
            if (err) {
            }
            if (foundReview) {
              Book.findOne({ id: req.params.id }, async (err, foundBook) => {
                if (err) console.log(err);
                Review.find({ book: foundBook._id })
                  .populate("reviewer")
                  .exec((err, reviews) => {
                    // console.log(reviews);
                    // console.log("REVIEWER ID IS: " + reviews[0].reviewer._id);
                    if (err) console.log(err.message);
                    res.render("../views/books/book.ejs", {
                      book: foundBook,
                      reviews,
                      currentUser: req.session.currentUser
                    });
                  });
              });
            } else {
              let url = `https://www.googleapis.com/books/v1/volumes/${req.params.id}`;
              request(url, { json: true }, async (err, response, data) => {
                if (err) console.log(err.message);
                res.render("../views/books/rate.ejs", {
                  data,
                  currentUser: req.session.currentUser
                });
              });
            }
          }
        );
      } else {
        let url = `https://www.googleapis.com/books/v1/volumes/${req.params.id}`;
        request(url, { json: true }, async (err, response, data) => {
          if (err) console.log(err.message);
          res.render("../views/books/rate.ejs", {
            data,
            currentUser: req.session.currentUser
          });
        });
      }
    });
  } else {
    res.redirect("/sessions/login");
  }
});

books.get("/:id", async (req, res) => {
  Book.findOne({ id: req.params.id }, (err, foundBook) => {
    if (err) console.log(err);
    Review.find({ book: foundBook._id })
      .populate("reviewer")
      .exec((err, reviews) => {
        if (err) console.log(err.message);
        res.render("../views/books/book.ejs", {
          book: foundBook,
          reviews,
          currentUser: req.session.currentUser
        });
      });
  });
});

books.post("/results/", (req, res) => {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.title}+inauthor:${req.body.author}`;
  request(url, { json: true }, (err, response, data) => {
    if (err) console.log(err.message);
    res.render("../views/books/searchresults.ejs", {
      data,
      currentUser: req.session.currentUser,
      searchTitle: req.body.title,
      searchAuthor: req.body.author
    });
  });
});

module.exports = books;
