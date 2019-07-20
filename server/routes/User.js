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
    let salt = uniqid();
    let newUser = new User({
      account: {
        username: req.body.username,
        biography: req.body.biography
      },
      email: req.body.email,
      token: uniqid(),
      salt: salt,
      hash: SHA256(req.body.password + salt).toString(encBase64)
    });
    newUser.save((err, user) => {
      if (err) {
        return rest.sendError(res, "The username or the email is already used");
      }
      return res.json({
        message: "User created",
        id: newUser["_id"],
        token: newUser.token,
        account: newUser.account
      });
    });
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
    await User.findOne(
      {
        $or: [
          { email: req.body.email },
          { "account.username": req.body.username }
        ]
      },
      (err, user) => {
        if (user) {
          let password = SHA256(req.body.password + user.salt).toString(
            encBase64
          );
          if (password === user.hash) {
            user.token = uniqid();
            user.save((err, user) => {
              if (err) {
                return rest.sendError(res, err.message);
              }
              return res.json({
                message: `connection granted: ${new Date().toUTCString()}`,
                id: user["_id"],
                token: user.token,
                account: user.account
              });
            });
          } else
            return rest.sendError(
              res,
              "connection refused: wrong password",
              401
            );
        } else
          return rest.sendError(res, "connection refused: unknown user", 401);
      }
    ).select("+salt +hash");
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
router.get("/user/find/:id", isAuth, async (req, res, next) => {
  try {
    await User.findById({ _id: req.params.id }, (err, user) => {
      if (user) {
        return res.json({
          message: "User found",
          user: {
            id: user["_id"],
            account: user.account
          }
        });
      }
    });
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

// **Update**
router.post("/user/edit/account", isAuth, async (req, res, next) => {
  try {
    await User.findOne(
      { "account.username": req.body.username },
      (err, user) => {
        if (user) return rest.sendError(res, "Username Already taken");

        req.user.account.username = req.body.username;
        if (req.body.biography) req.user.account.biography = req.body.biography;
        req.user.save();
        return res.json({ message: `User has been updated` });
      }
    );
  } catch (err) {
    return rest.sendError(res, err.message);
  }
});

router.post("/user/edit/email", isAuth, async (req, res, next) => {
  try {
    await User.findOne({ email: req.body.email }, (err, user) => {
      if (user) return rest.sendError(res, "email already taken");

      req.user.email = req.body.email;
      if (req.body.biography) req.user.account.biography = req.body.biography;
      req.user.save();
      return res.json({ message: `Email has been updated` });
    });
  } catch (err) {
    return rest.sendError(res, err.message);
  }
});

router.post("/user/edit/password", isAuth, async (req, res, next) => {
  try {
    User.findById(req.user._id, "hash salt", (err, user) => {
      newPassword = SHA256(req.body.password + user.salt).toString(encBase64);
      if (newPassword === user.hash)
        return rest.sendError(
          res,
          "Choose a different password than your actual one"
        );

      user.hash = newPassword;
      user.save();
      return res.json({ message: `Your password has been updated` });
    });
  } catch (err) {
    return rest.sendError(res, err.message);
  }
});

// router.get("/user/log_out", async (req, res, next) => {
//   try {
//     if (req.session) {
//       await req.session.destroy(function(err) {
//         if (err) {
//           rest.sendError(res, err.message);
//         } else {
//           delete req.session;
//           console.log(req.session);
//           next();
//         }
//       });
//     }
//   } catch (error) {
//     return rest.sendError(res, error.message);
//   }
// });

// **Delete**
router.get("/user/delete/:id", async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
  } catch (error) {
    return rest.sendError(res, error.message);
  }
});

// Middlewares
function isAuth(req, res, next) {
  var bearer = req.headers.authorization.replace("Bearer ", "");
  return User.findOne({ token: bearer }, (err, user) => {
    if (user) {
      req.user = user;
      next();
    } else rest.sendError(res, "invalid token", 401);
  });
}

module.exports = router;
