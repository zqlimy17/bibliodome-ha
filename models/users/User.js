const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  ratingCount: { type: Number, default: null }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
