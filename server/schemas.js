const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

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

const User = mongoose.model("User", {
  account: {
    username: {
      type: String,
      unique: true
    },
    biography: String
  },
  email: {
    type: String,
    select: false,
    unique: true
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
