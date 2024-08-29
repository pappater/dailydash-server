const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
import { Request, Response } from "express";

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  savedData: String,
});

const User = mongoose.model("User", userSchema);

router.post("/saveData", async (req: Request, res: Response) => {
  const { googleId, savedData } = req.body;
  try {
    let user = await User.findOne({ googleId });

    if (user) {
      // Update the user's data
      user.savedData = savedData;
      await user.save();
    } else {
      // Create a new user if not found
      user = new User({ googleId, savedData });
      await user.save();
    }

    res.status(200).send("Data saved successfully");
  } catch (error) {
    res.status(500).send("Server Error");
  }
});
router.get("/getData/:googleId", async (req: Request, res: Response) => {
  const googleId = req.params.googleId;
  try {
    const user = await User.findOne({ googleId });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

export default router;
