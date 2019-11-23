const express = require("express");
const User = require("../models/users/User");
const users = express.Router();
const Review = require("../models/reviews/Reviews");
const bcrypt = require("bcrypt");
const request = require("request");

users.get("/signup", (req, res) => {
  res.render("../views/users/sign-up.ejs", {
    currentUser: req.session.currentUser
  });
});

users.get("/profile/:username", (req, res) => {
  User.findOne({ username: req.params.username }, (err, user) => {
    try {
      Review.find({ reviewer: user._id })
        .populate("book")
        .exec((errr, reviews) => {
          if (errr) console.log(errr.message);
          res.render("../views/users/userprofile.ejs", {
            currentUser: req.session.currentUser,
            reviews,
            profile: user
          });
        });
    } catch (err) {
      res.render("../views/err/404.ejs", {
        currentUser: req.session.currentUser
      });
    }
  });
});

users.get("/profile/:username/edit", (req, res) => {
  res.render("../views/users/editprofile.ejs", {
    currentUser: req.session.currentUser
  });
});

users.post("/", (req, res) => {
  req.body.password = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10)
  );
  User.create(
    {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      ratingCount: 0
    },
    (err, createdUser) => {
      if (err) console.log(err.message);
      res.redirect("/sessions/login");
    }
  );
});

users.put("/:id/edit", (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.params.id },
    { name: req.body.name },
    (err, foundUser) => {
      res.redirect("/users/profile/" + req.session.currentUser.username);
    }
  );
});

module.exports = users;
