const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  review: String,
  reviewer: { type: mongoose.Schema.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, default: 1 },
  book: { type: mongoose.Schema.ObjectId, ref: "Book" }
});

let Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
