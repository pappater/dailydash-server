import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

interface UserProfile {
  id: string;
  displayName: string;
  emails: { value: string }[];
  // Add other properties as needed
}

const router = Router();
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// Configure Passport Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "default-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "default-client-secret",
      callbackURL: "http://localhost:5001/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user data here
      console.log("profile", profile);

      done(null, profile);
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user: UserProfile, done) => {
  done(null, user);
});

// Routes remain the same
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("res", res);

    res.redirect("http://localhost:5174/dashboard");
  }
);

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Send user profile data
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
