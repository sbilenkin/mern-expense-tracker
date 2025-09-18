import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017/expense-tracker";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.json({ message: "John Pork" });
});

// Database health check
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  res.json({ database: dbStatus });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});