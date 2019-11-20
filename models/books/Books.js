const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  id: String,
  title: { type: String, unique: true },
  author: Array,
  description: String,
  img: String,
  rating: { type: Number, default: 1 },
  ratingCount: { type: Number, default: 1 }
});

let Book = mongoose.model("Book", bookSchema);
module.exports = Book;
