const mongoose = require("mongoose");

// Room
const Room = mongoose.model("Room", {
  title: String,
  description: String,
  photos: [String],
  price: Number,
  ratingValue: {
    type: Number,
    default: null
  },
  reviews: {
    type: Number,
    default: 0
  },
  city: String,
  loc: {
    type: [Number],
    index: "2dsphere"
  }
});

// User
const User = mongoose.model("User", {
  account: {
    username: String,
    biography: String
  },
  email: {
    type: String,
    select: false
  },
  token: String,
  hash: {
    type: String,
    select: false
  },
  salt: {
    type: String,
    select: false
  }
});

module.exports = {
  room: Room,
  user: User
};
