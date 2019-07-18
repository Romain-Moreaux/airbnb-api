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
    var user = await User.findOne({
      $or: [
        { "account.username": req.body.username },
        { email: req.body.email }
      ]
    });
    if (!!user) {
      return rest.sendError(res, "User already exist");
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
      return res.json({
        message: "User created",
        id: newUser["_id"],
        token: newUser.token,
        account: newUser.account
      });
    }
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});
/*
    Log in user
    @params `req: {Object}`
*/
router.post("/user/log_in", async (req, res) => {
  try {
    var user, result;
    user = await User.findOne({
      $or: [
        { email: req.body.email },
        { "account.username": req.body.username }
      ]
    }).select("+salt +hash");

    if (user) {
      let password = SHA256(req.body.password + user.salt).toString(encBase64);
      if (password === user.hash) {
        result = {
          message: `connection granted: ${new Date().toUTCString()}`,
          id: user["_id"],
          token: user.token,
          account: user.account
        };
        req.session.userId = user["_id"];
      } else
        return rest.sendError(res, "connection refused: wrong password", 401);
    } else return rest.sendError(res, "connection refused: unknown user", 401);

    return res.json(result);
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

/* 
    Get all users
    @params `req: {Object}`
*/
router.get("/users", async (req, res) => {
  try {
    var users = await User.find().select("+email +token +hash +salt");
    return res.json(users);
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

// Get user by id
// @param `req: {Object}`
router.get("/user/find/:id", async (req, res) => {
  try {
    var result, isAuth, bearer;

    bearer = req.headers.authorization.replace("Bearer ", "");
    isAuth = await User.findOne({ token: bearer });

    if (isAuth) {
      await User.findById({ _id: req.params.id }, (err, user) => {
        result = {
          message: "User found",
          user: {
            id: user["_id"],
            account: user.account
          }
        };
      });
    } else return rest.sendError(res, "invalid token", 401);

    return res.json(result);
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

// **Update**
router.post("/user/edit/account", async (req, res, next) => {
  var isLogged = rest.isLogged(req, res, next);
  var isUserExist = false;
  if (isLogged) {
    await User.findById({ _id: req.session.userId }, async (err, user) => {
      await User.findOne(
        { "account.username": req.body.username },
        (err, found) => {
          if (found) isUserExist = true;
          else user.account.username = req.body.username;
        }
      );

      if (isUserExist) return rest.sendError(res, "Username Already taken");

      if (req.body.biography) user.account.biography = req.body.biography;
      user.save();

      return res.json({ message: `User has been updated` });
    });

    // let searchUser = await User.findById({ _id: req.session.userId }).findOne({
    //   "account.username": req.body.username
    // });
    // console.log(searchUser);
    // return res.json({ message: `User has been updated` });
  } else {
    return rest.sendError(res, "You must be logged to use that action", 401);
  }
});

router.post("/user/edit/email", async (req, res, next) => {
  var isLogged = rest.isLogged(req, res, next);
  if (isLogged) {
    await User.findById({ _id: req.session.userId }, async (err, user) => {
      await User.findOne({ email: req.body.email }, (err, found) => {
        if (found) {
          return rest.sendError(res, "Email Already taken");
        } else {
          user.email = req.body.email;
          user.save();
          return res.json({ message: `Email has been updated` });
        }
      });
    });
  } else {
    return rest.sendError(res, "You must be logged to use that action", 401);
  }
});

router.post("/user/edit/password", async (req, res, next) => {
  var isLogged = rest.isLogged(req, res, next);
  if (isLogged) {
    await User.findById({ _id: req.session.userId }, (err, user) => {
      let password = req.body.password;
      user.hash = SHA256(password + user.salt).toString(encBase64);
      user.save();
      return res.json({ message: `Your password has been updated` });
    }).select("+hash +salt");
  } else {
    return rest.sendError(res, "You must be logged to use that action", 401);
  }
});

router.get("/user/log_out", async (req, res) => {
  try {
    //session always up, find why ?
    console.log(req.session);

    if (req.session) {
      await req.session.destroy(function(err) {
        if (err) {
          rest.sendError(res, err.message);
        } else {
          delete req.session;
          console.log(req.session);

          return res.json({ message: `You have been disconnected` });
        }
      });
    }
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

// **Delete**
router.get("/user/delete/:id", async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

module.exports = router;
