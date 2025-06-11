import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from "path";

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve(); // For Production

app.use(cors({ origin: "http://localhost:5173", credentials: true})); // allows send data and get it from other servers

// Middleware
app.use(express.json()); // allows us to parse JSON from req.body
app.use(cookieParser()); // allows us to parse incoming cookies


// Routes
app.use("/api/auth", authRoutes);

// Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  // ✅ Use a named wildcard (e.g. splat)
  app.get("/*splat", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "frontend", "dist", "index.html")
    );
  });
}

// Server setup
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB();
});