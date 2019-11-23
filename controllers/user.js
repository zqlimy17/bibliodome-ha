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
    if (err) console.log(err.message);

    Review.find({ reviewer: user._id })
      .populate("book")
      .exec((errr, reviews) => {
        if (errr) console.log(errr.message);
        res.render("../views/users/userprofile.ejs", {
          currentUser: req.session.currentUser,
          reviews,
          profileUser: req.params.username
        });
      });
  });
});

users.get("/profile/:username/edit", (req, res) => {
  res.render("../views/users/editprofile.ejs", {
    currentUser: req.session.currentUser
  });
});

users.post("/", (req, res) => {
  console.log(req.body);
  req.body.password = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10)
  );
  User.create(
    {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    },
    (err, createdUser) => {
      if (err) console.log(err.message);
      console.log(createdUser);
      res.redirect("/sessions/login");
    }
  );
});

users.put("/:id/edit", (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, (err, foundUser) => {
    res.redirect("/users/profile/" + req.session.currentUser.username);
    // res.redirect("/users/profile/" + req.session.currentUser.username);
  });
});

module.exports = users;
