const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(bodyParser.json());

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

app.listen(3100, () => {
  console.log("Server started");
});
