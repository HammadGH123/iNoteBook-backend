const express = require("express");
const User = require("../Models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = process.env.JWT_SECRET;

let success = false;

// ROUTE 1 :   Creating a user using POST : api/auth/CreateUser endpoint, No login reequired

router.post(

  "/CreateUser",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password should be atleast 5 characters long").isLength({min: 5}),
  ],
  //Check for incorrect values
  async (req, res) => {
    const errors = validationResult(req);
    success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    //Check if the email already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "User with this email already exists" });
    }

    try {
      
      // Creating new user
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      // Creating jwt token
      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      success = true;
      res.json({ success, authToken, message: "User created successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(success, "Please Contact Support");
    }
  }
);

//ROUTE 2 :   Authenticate a user using POST : api/auth/login endpoint, No login reequired

router.post(

  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Please enter password").exists(),
  ],
  //Check for incorrect values
  async (req, res) => {
    const errors = validationResult(req);
    success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success,  errors: errors.array() });
    }

    // Checking incorrect creds
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: "Incorrect Credentials" });
    }
    const passCompare = await bcrypt.compare(password, user.password);
    if (!passCompare) {
      return res.status(400).json({success, error: "Incorrect Credentials" });
    }

    // Dispatching Token
    try {
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(success , "Please Contact Support");
    }
  }
);

// ROUTE 3 :  Get loggedin user Details using POST : /api/auth/getuser endpoint,login reequired

router.post('/getuser' , fetchuser, async (req,res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    return res.send(user);
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
})

module.exports = router;
