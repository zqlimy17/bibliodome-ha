const express = require("express");
const Review = require("../models/reviews/Reviews");
const Book = require("../models/books/Books");
const User = require("../models/users/User");
const reviews = express.Router();

const request = require("request");

reviews.get("/:id/edit-review", (req, res) => {
  if (req.session.currentUser) {
    Book.findOne({ id: req.params.id }, (err, foundBook) => {
      if (err) console.log(err.message);
      Review.findOne(
        { book: foundBook._id, reviewer: req.session.currentUser._id },
        (err, foundReview) => {
          res.render("../views/books/edit-review.ejs", {
            currentUser: req.session.currentUser,
            book: foundBook,
            review: foundReview
          });
        }
      );
    });
  } else {
    res.redirect("/sessions/login");
  }
});

reviews.put("/:id/edit", (req, res) => {
  Book.findOneAndUpdate({ id: req.params.id }, (err, foundBook) => {
    Review.findOneAndUpdate(
      { reviewer: req.session.currentUser._id, book: foundBook._id },
      {
        $set: {
          rating: req.body.stars,
          review: req.body.review
        }
      },
      (err, review) => {}
    );
  });
  res.redirect("/books/" + req.params.id);
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
  res.redirect("/users/profile/" + req.session.currentUser.username);
});

reviews.delete("/:rd/:id", async (req, res) => {
  let newRating = req.body.stars;
  await Review.findOneAndDelete(
    { _id: req.params.rd },
    async (err, deletedReview) => {
      console.log("DELETED REVIEW IS " + deletedReview);
      console.log("1 Deleting");
      if (err) console.log(err.message);
      console.log("Review has been deleted!");
      Book.findOne({ id: req.params.id }, async (err, result) => {
        console.log("2 Finding");
        console.log("REQ PARAMS ID IS " + req.params.id);
        console.log("RESULT IS " + result);
        console.log("DELETED REVIEW IS " + deletedReview);
        if (err) console.log(err.message);
        if (result.rating !== null) {
          newRating =
            (parseFloat(result.rating) * parseFloat(result.ratingCount) -
              parseFloat(deletedReview.rating)) /
            (parseFloat(result.ratingCount) - 1);
        }
        console.log("New Rating is ", newRating);
        console.log(typeof newRating);
        Book.updateOne(
          { id: req.params.id },
          {
            $set: { rating: newRating },
            $inc: { ratingCount: -1 }
          },
          (err, asd) => {
            if (err) console.log(err.message);
          }
        );
      });
    }
  );
  console.log("4");
  res.redirect("/books/" + req.params.id);
});

module.exports = reviews;
