const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const session = require("express-session");

const app = express();

app.use(bodyParser.json());
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: true,
//     saveUninitialized: false
//   })
// );

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/airbnb-api",
  {
    useNewUrlParser: true
  }
);

const roomRoutes = require("./routes/Room");
app.use(roomRoutes);
const userRoutes = require("./routes/User");
app.use(userRoutes);

app.all("*", (req, res) => {
  res.send("all routes");
});

app.listen(3000, () => {
  console.log("Server started");
});
