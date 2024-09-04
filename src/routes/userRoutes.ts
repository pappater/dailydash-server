const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
import { Request, Response } from "express";

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  savedData: String,
  widgetConfig: { type: Object, default: {} },
  calendarEvents: [
    {
      date: String,
      text: String,
      completed: { type: Boolean, default: false }, // Add the completed field with a default value
    },
  ],
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

/// Route to get widget configuration
router.get("/widgetConfig/:googleId", async (req: Request, res: Response) => {
  const googleId = req.params.googleId;
  try {
    const user = await User.findOne({ googleId });

    if (user) {
      // Add a check to ensure widgetConfig is not undefined
      console.log("Fetched widgetConfig:", user.widgetConfig);

      res.status(200).json(user.widgetConfig || {});
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

// Route to save widget configuration
router.post("/widgetConfig", async (req: Request, res: Response) => {
  const { googleId, widgetConfig } = req.body;
  console.log("pratheesh1 googleId", googleId);
  console.log("pratheesh1 widgetConfig", widgetConfig);

  try {
    let user = await User.findOne({ googleId });

    if (user) {
      user.widgetConfig = widgetConfig;
      await user.save();
      console.log("Updated widgetConfig for user:", user);
    } else {
      user = new User({ googleId, widgetConfig });
      await user.save();
      console.log("Created new user with widgetConfig:", user);
    }

    res.status(200).send("Widget configuration saved successfully");
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

// Route to save a calendar event
router.post("/calendarEvents", async (req: Request, res: Response) => {
  const { googleId, event } = req.body;
  console.log("req.body--", req.body);

  try {
    let user = await User.findOne({ googleId });

    if (user) {
      user.calendarEvents = [...user.calendarEvents, event];
      await user.save();
      console.log("Added new event for user:", user);
    } else {
      user = new User({ googleId, calendarEvents: [event] });
      await user.save();
      console.log("Created new user with first event:", user);
    }

    res.status(200).send("Calendar event saved successfully");
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/calendarEvents/:googleId", async (req: Request, res: Response) => {
  const googleId = req.params.googleId;
  try {
    const user = await User.findOne({ googleId });

    if (user) {
      console.log("Fetched calendar events:", user.calendarEvents);
      res.status(200).json(user.calendarEvents || []);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

// Route to delete calendar event
router.delete(
  "/calendarEvents/:googleId/:eventId",
  async (req: Request, res: Response) => {
    const { googleId, eventId } = req.params;

    try {
      const user = await User.findOne({ googleId });

      if (user && user.calendarEvents) {
        user.calendarEvents = user.calendarEvents.filter(
          (event) => event._id.toString() !== eventId
        );
        await user.save();
        res.status(200).send("Event deleted successfully");
      } else {
        res.status(404).send("User or event not found");
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).send("Server Error");
    }
  }
);

router.put("/calendarEvents/:eventId", async (req: Request, res: Response) => {
  const { googleId, completed } = req.body;
  const { eventId } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { googleId, "calendarEvents._id": eventId },
      { $set: { "calendarEvents.$.completed": completed } },
      { new: true }
    );

    if (user) {
      res.status(200).send("Event updated successfully");
    } else {
      res.status(404).send("Event not found");
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
