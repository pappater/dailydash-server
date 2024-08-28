import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/authRoutes';
// import userRoutes from './routes/userRoutes';

const app = express();

console.log('Loaded Environment Variables:', process.env); // Check all environment variables
console.log('Loaded GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
const googleClientId = process.env.GOOGLE_CLIENT_ID ?? 'hardcoded-client-id';
console.log('Google Client ID:', googleClientId);

// Middleware
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'fallback-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

export default app;
