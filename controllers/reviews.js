const express = require("express");
const Review = require("../models/reviews/Reviews");
const Book = require("../models/books/Books");
const reviews = express.Router();
const request = require("request");

reviews.get("/:id/edit-review", (req, res) => {
  if (req.session.currentUser) {
    Book.findOne({ id: req.params.id }, (err, book) => {
      if (err) console.log(err.message);
      res.render("../views/books/edit-review.ejs", {
        currentUser: req.session.currentUser,
        book
      });
    });
  } else {
    res.redirect("/sessions/login");
  }
});

reviews.put("/:id/edit", (req, res) => {
  console.log("CURRENT USER ID IS: " + req.session.currentUser._id);
  console.log("CURRENT USER ID IS: " + req.session.currentUser._id);
  Book.findOne({ id: req.params.id }, (err, foundBook) => {
    console.log(foundBook);

    console.log(foundBook);
    Review.findOneAndUpdate(
      { reviewer: req.session.currentUser._id, book: foundBook._id },
      {
        $set: {
          rating: req.body.stars,
          review: req.body.review
        }
      },
      (err, review) => {
        console.log("this is working");
        console.log(review);
      }
    );
  });

  res.redirect("/books/" + req.params.id);
  console.log("BOOK UPDATED!");
});

reviews.put("/:id/new", async (req, res) => {
  let url = await `https://www.googleapis.com/books/v1/volumes/${req.params.id}`;
  console.log(url);
  await request(url, { json: true }, async (error, response, data) => {
    let newRating = req.body.stars;
    Book.findOne({ id: req.params.id }, async (err, result) => {
      console.log(result);
      console.log(result.rating);
      if (err) console.log(err.message);
      if (result.rating !== null) {
        newRating =
          (parseFloat(req.body.stars) +
            parseFloat(result.rating) * parseFloat(result.ratingCount)) /
          (parseFloat(result.ratingCount) + 1);
      }
      console.log(newRating);
    });
    Book.findOneAndUpdate(
      {
        id: req.params.id
      },
      {
        id: data.id,
        id: data.id,
        title: data.volumeInfo.title,
        description: data.volumeInfo.description,
        img: data.volumeInfo.imageLinks.thumbnail,
        author: data.volumeInfo.authors,
        $set: { rating: newRating },
        $inc: {
          ratingCount: 1
        }
      },
      {
        upsert: true,
        new: true
      },
      (err, book) => {
        Review.create({
          rating: req.body.stars,
          review: req.body.review,
          reviewer: req.session.currentUser._id,
          book: book._id
        });
      }
    );
  });

  res.redirect("/");
});

reviews.delete("/:id/:rd", (req, res) => {
  Review.findOneAndDelete({ _id: req.params.id }, err => {
    if (err) console.log(err.message);
    console.log("Review has been deleted!");
  });
  res.redirect("/books/" + req.params.rd);
});

module.exports = reviews;
