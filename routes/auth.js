var express = require("express");
var router = new express.Router();
const userModel = require("../models/User");
const buildingModel = require("../models/Building");
const uploader = require("./../config/cloudinary");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.post("/signup", uploader.single("avatar"), (req, res, next) => {
  const { name, lastname, email, password, key } = req.body;

  if (!name || !lastname || !email || !password) {
    return res.status(400).json("You need to provide all the fields");
  }
  if (!key) {
    return res.status(400).json("You need to provide a key");
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  const newUser = {
    name,
    lastname,
    email,
    password: hashPass
  };

  if (req.file) {
    newUser.avatar = req.file.secure_url;
  }

  buildingModel
    .findOne({ keys: key })
    .then(building => {
      if (building === null) {
        return res.status(400).json("Invalid key");
      }
      newUser.buildings = [building._id];

      userModel
        .create(newUser)
        .then(createdUser => {
          buildingModel
            .findByIdAndUpdate(building._id, { $pull: { keys: key } })
            .then(updatedBuilding => {
              res.status(200).json(createdUser);
            })
            .catch(next);
        })
        .catch(next);
    })
    .catch(next);
});

router.post("/signin", (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(400).json("Please enter both, email and password");
  }

  userModel
    .findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(400).json("Incorrect email or password");
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.status(200).json(); //need something
      } else {
        return res.status(400).json("Incorrect email or password");
      }
    })
    .catch(next);
});

router.get("/signout", (req, res, next) => {
  req.session.destroy(err => {
    res.status(200);
  });
});

router.use("/is-loggedin", (req, res, next) => {
  if (req.session.currentUser) {
    const { _id, username, favorites, email, avatar, role } = req.session.currentUser;

    return res.status(200).json({
      currentUser: {
        _id,
        username,
        email,
        avatar,
        favorites,
        role
      }
    });
  } else res.status(403).json("err: not logged in");
});

module.exports = router;
