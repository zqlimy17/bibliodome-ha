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
  Book.findOne({ id: req.params.id }, (err, b) => {
    Review.findOne(
      { reviewer: req.session.currentUser._id, book: b._id },
      (err, r) => {
        let calc = b.rating * b.ratingCount;
        let y =
          parseFloat(calc) - parseFloat(r.rating) + parseFloat(req.body.stars);
        let z = parseFloat(y) / parseFloat(b.ratingCount);
        Book.findOneAndUpdate(
          { _id: b._id },
          {
            $set: { rating: z }
          },
          err => {
            Review.updateOne(
              { reviewer: req.session.currentUser._id, book: b._id },
              {
                rating: req.body.stars,
                review: req.body.review
              },
              (err, review) => {
                res.redirect("/books/" + req.params.id);
              }
            );
          }
        );
      }
    );
  });
});

reviews.put("/:id/new", async (req, res) => {
  let url = await `https://www.googleapis.com/books/v1/volumes/${req.params.id}`;
  await request(url, { json: true }, async (error, response, data) => {
    let newRating;
    Book.findOne({ id: req.params.id }, async (err, result) => {
      if (err) console.log(err.message);
      if (result !== null) {
        newRating =
          (parseFloat(req.body.stars) +
            parseFloat(result.rating) * parseFloat(result.ratingCount)) /
          (parseFloat(result.ratingCount) + 1);
        Book.findOneAndUpdate(
          {
            id: req.params.id
          },
          {
            $set: { rating: newRating },
            $inc: {
              ratingCount: 1
            }
          },
          (err, bookx) => {
            User.updateOne(
              {
                _id: req.session.currentUser._id
              },
              {
                $inc: {
                  ratingCount: 1
                }
              },
              (err, uuser) => {
                if (err) console.log(err.message);
              }
            );
            Review.findOne(
              { _id: req.session.currentUser._id, book: bookx._id },
              (err, ureview) => {
                if (!ureview) {
                  Review.create({
                    rating: req.body.stars,
                    review: req.body.review,
                    reviewer: req.session.currentUser._id,
                    book: bookx._id
                  });
                } else {
                  Review.updateOne(
                    { _id: req.session.currentUser._id, book: bookx._id },
                    {
                      rating: req.body.stars,
                      review: req.body.review
                    },
                    (err, xreview) => {}
                  );
                }
              }
            );
            if (err) console.log(err.message);
          }
        );
      } else {
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
            $set: { rating: req.body.stars },
            $inc: {
              ratingCount: 1
            }
          },
          {
            upsert: true,
            new: true
          },
          (err, book) => {
            User.updateOne(
              {
                _id: req.session.currentUser._id
              },
              {
                $inc: {
                  ratingCount: 1
                }
              },
              (err, uuser) => {
                if (err) console.log(err.message);
              }
            );
            Review.create({
              rating: req.body.stars,
              review: req.body.review,
              reviewer: req.session.currentUser._id,
              book: book._id
            });
            if (err) console.log(err.message);
          }
        );
      }
    });
  });
  res.redirect("/users/profile/" + req.session.currentUser.username);
});

reviews.delete("/:rd/:id", async (req, res) => {
  let newRating = req.body.stars;
  await Review.findOneAndDelete(
    { _id: req.params.rd },
    async (err, deletedReview) => {
      if (err) console.log(err.message);
      Book.findOne({ id: req.params.id }, async (err, result) => {
        if (err) console.log(err.message);
        if (result.ratingCount > 1) {
          if (result.rating !== null) {
            newRating =
              (parseFloat(result.rating) * parseFloat(result.ratingCount) -
                parseFloat(deletedReview.rating)) /
              (parseFloat(result.ratingCount) - 1);
          }
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
        } else {
          Book.updateOne(
            { id: req.params.id },
            {
              $set: { rating: 0 },
              $inc: { ratingCount: -1 }
            },
            (err, asd) => {
              if (err) console.log(err.message);
            }
          );
        }
        User.updateOne(
          {
            _id: req.session.currentUser._id
          },
          {
            $inc: {
              ratingCount: -1
            }
          },
          (err, uuser) => {
            if (err) console.log(err.message);
          }
        );
      });
    }
  );
  res.redirect("/books/" + req.params.id);
});

module.exports = reviews;
