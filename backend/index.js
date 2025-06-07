import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json()); // allows us to parse JSON from req.body
app.use(cookieParser()); // allows us to parse incoming cookies


// Routes
app.use("/api/auth", authRoutes);


// Server setup
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB();
});