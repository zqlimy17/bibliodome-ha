const express = require("express");
const sessions = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/users/User");

sessions.get("/login", (req, res) => {
  res.render("../views/sessions/login.ejs", {
    currentUser: req.session.currentUser
  });
});

sessions.post("/", (req, res) => {
  User.findOne({ username: req.body.username }, (err, foundUser) => {
    // if db error handle the db error
    if (err) {
      console.log(err);
      res.send("oops something went wrong");
      // if user not found, handle the error
    } else if (!foundUser) {
      res.send("user not found!");
    } else {
      if (bcrypt.compareSync(req.body.password, foundUser.password)) {
        req.session.currentUser = foundUser;
        res.redirect("/");
      } else {
        res.send('<a href="/">wrong password</a>');
      }
    }
  });
});

sessions.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = sessions;
