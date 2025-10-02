import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017/expense-tracker";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const transactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'expense'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

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
  res.json({ message: "backend server" });
});

// Database health check
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  res.json({ database: dbStatus });
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ detail: "Invalid username or password" });
    }
    res.json({ message: "Login successful", user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ detail: "Username already exists" });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: { username: newUser.username }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ detail: "Username already exists" });
    }
    res.status(500).json({ detail: "Server error" });
  }
});

// Get transactions for a user
app.get("/transactions/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }
    const transactions = await Transaction.find({ username });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ detail: "Server error" });
  }
});

// Add a new transaction
app.post("/transactions", async (req, res) => {
  try {
    const { username, description, amount, date, type } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }
    if (!description || !amount || !type) {
      return res.status(400).json({ detail: "Missing required fields" });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ detail: "Invalid transaction type" });
    }
    const newTransaction = new Transaction({
      username,
      description,
      amount: parseFloat(amount),
      type,
      date: date ? new Date(date) : new Date(),
    });
    await newTransaction.save();
    res.status(201).json({ message: "Transaction added successfully", transaction: newTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});