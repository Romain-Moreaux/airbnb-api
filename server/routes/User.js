const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uniqid = require("uniqid");

router.use(bodyParser.json());

const models = require("../schemas.js");
const rest = require("../assets/Rest.js");

const User = models.user;

/*
    Create user
    @params `req: {Object}`
*/
router.post("/user/sign_up", async (req, res) => {
  try {
    const user = await User.findOne({ title: req.body.username });
    if (!!user) {
      rest.sendError(res, "User already exist");
    } else {
      let password = req.body.password;
      let salt = uniqid();
      let token = uniqid();
      const newUser = new User({
        account: {
          username: req.body.username,
          biography: req.body.biography
        },
        email: req.body.email,
        token: token,
        salt: salt,
        hash: SHA256(password + salt).toString(encBase64)
      });
      await newUser.save();
      console.log(newUser.token);

      res.json({
        message: "User created",
        id: newUser["_id"],
        token: newUser.token,
        account: newUser.account
      });
    }
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

/* 
    Get all users
    @params `req: {Object}`
*/
router.get("/users", async (req, res) => {
  try {
    users = await User.find();
    res.json(users);
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

// Get user by id
// @param `req: {Object}`
router.get("", async (req, res) => {});

// **Update**
router.post("/user/update", async (req, res) => {});

// **Delete**
router.get("/user/delete/:id", async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

module.exports = router;
