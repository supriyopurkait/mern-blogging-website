import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./react-js-blog-website-c3587-firebase-adminsdk-yrei8-8bdd095672.json");

// Import Schema
import User from "./Schema/User.js";

// Regex patterns for validation
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

// Initialize Express
const server = express();
const port = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
server.use(express.json());
server.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_LOCATION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("DB connection error:", err));

// Helper function to format data
const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

// Helper function to generate unique usernames
const generateUsername = async (email) => {
  let username = email.split("@")[0];
  const isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  });
  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

// Signup Route
server.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validation
  if (fullname.length < 3) {
    return res
      .status(400)
      .json({ error: "Full name must be at least 3 characters long." });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one digit.",
    });
  }

  // Hash password and save user
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);
    const newUser = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });
    const savedUser = await newUser.save();
    res.status(201).json(formatDatatoSend(savedUser));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// Signin Route
server.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }

    if (!user.google_auth) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Incorrect password." });
      }

      res.status(200).json(formatDatatoSend(user));
    }else{
      return res.status(401).json({ error: "Account alrady created using this mail through Google." });

    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google login credential authentication
server.post("/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;

    // Verify that access_token exists and is a string
    if (!access_token || typeof access_token !== "string") {
      return res.status(400).json({
        error:
          "Invalid access token format. Please provide a valid Firebase ID token.",
      });
    }

    try {
      const decodedUser = await getAuth().verifyIdToken(access_token);
      let { email, name, picture } = decodedUser;

      // Update picture URL to get higher resolution
      picture = picture?.replace("s96-c", "s384-c") || "";

      // Find existing user
      let user = await User.findOne({ "personal_info.email": email }).select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
      );

      if (user) {
        // Check if user was originally signed up with Google
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without Google. Please log in with password to access the account",
          });
        }
      } else {
        // Create new user
        const username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });

        await user.save();
      }

      return res.status(200).json(formatDatatoSend(user));
    } catch (verificationError) {
      console.error("Token verification error:", verificationError);
      return res.status(401).json({
        error: "Invalid token. Please try logging in again.",
      });
    }
  } catch (err) {
    console.error("Server error during Google auth:", err);
    return res.status(500).json({
      error: "Authentication failed. Please try again later.",
    });
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
