import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import scrapeRoutes, { fetchQuotes } from "./routes/scrapeRoutes";
import cors from "cors";
import promptRoutes from "./routes/promptRoutes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true, // Allow cookies to be sent and received
  })
);

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "hardcoded-client-id";

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/scrape", scrapeRoutes);

// const initialURL = `https://www.nitch.com/posts/?before=1724427573`;
// fetchQuotes(initialURL);

export default app;
