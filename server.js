// DEPENDENCIES
const express = require("express"),
  mongoose = require("mongoose"),
  User = require("./models/users/User"),
  Book = require("./models/books/Books"),
  Review = require("./models/reviews/Reviews"),
  bookController = require("./controllers/book.js"),
  userController = require("./controllers/user.js"),
  reviewController = require("./controllers/reviews.js"),
  sessionsController = require("./controllers/sessions.js"),
  session = require("express-session"),
  methodOverride = require("method-override"),
  apikey = "AIzaSyDoL5gz0KiFhLv23cCa2IrjI1F77cRtm6M",
  app = express();
require("dotenv").config();
const PORT = process.env.PORT;

// Global configuration
const mongoURI = process.env.MONGODB_URI;
const db = mongoose.connection;

// Mongoose Deprecation Warnings
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

//Connect to Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true }, () => {
  console.log("\n ~~~~~ \n");
  console.log("The connection with mongod is established.");
  console.log("\n ~~~~~ \n");
});

// Connection Error/Success
// Define callback functions for various events
db.on("error", err => console.log(err.message + " is mongod not running?"));
db.on("connected", () => console.log("mongo connected: ", mongoURI));
db.on("disconnected", () => console.log("mongo disconnected"));

// MIDDLEWARE
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// CONTROLLERS
app.use("/books", bookController);
app.use("/users", userController);
app.use("/sessions", sessionsController);
app.use("/reviews", reviewController);

app.get("/", async (req, res) => {
  let bookData = Book.find({})
    .sort({ rating: -1 })
    .limit(5);
  bookData.find({}, async (err, book) => {
    if (err) console.log(err.message);
    res.render("index.ejs", {
      book,
      currentUser: req.session.currentUser
    });
    // console.log(req.session.currentUser);
  });
});

app.listen(PORT, () => {
  console.log(`Flipping to Page: ${PORT}`);
});
