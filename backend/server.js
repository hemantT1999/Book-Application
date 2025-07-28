const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const reviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  author: String,
  review: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const bookRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  rating: { type: Number, min: 1, max: 5 },
});

const User = mongoose.model("User", userSchema);
const Review = mongoose.model("Review", reviewSchema);
const BookRating = mongoose.model("BookRating", bookRatingSchema);

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hash });
    res.json({ message: "User created" });
  } catch {
    res.status(400).json({ error: "Username taken" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET
  );
  res.json({ token });
});

app.post("/api/reviews", auth, async (req, res) => {
  const { title, author, review, rating } = req.body;
  if (!title || !author || !review || !rating)
    return res.status(400).json({ error: "Missing fields" });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: "Invalid rating" });
  await Review.create({
    userId: req.user.userId,
    title,
    author,
    review,
    rating,
  });
  res.json({ message: "Review added" });
});

app.get("/api/reviews", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("userId", "username");
  res.json(reviews);
});

app.post("/api/rate-book", auth, async (req, res) => {
  const { bookId, rating } = req.body;
  if (!bookId || !rating)
    return res.status(400).json({ error: "Missing fields" });
  let bookRating = await BookRating.findOne({ userId: req.user.id, bookId });
  if (bookRating) {
    bookRating.rating = rating;
    await bookRating.save();
  } else {
    await BookRating.create({ userId: req.user.id, bookId, rating });
  }
  res.json({ message: "Rating saved" });
});

app.get("/api/user-book-ratings", auth, async (req, res) => {
  const ratings = await BookRating.find({ userId: req.user.id });
  const ratingsMap = {};
  ratings.forEach((r) => {
    ratingsMap[r.bookId] = r.rating;
  });
  res.json(ratingsMap);
});

app.get("/api/book-avg-ratings", async (req, res) => {
  const ratings = await BookRating.aggregate([
    { $group: { _id: "$bookId", avg: { $avg: "$rating" } } },
  ]);
  const map = {};
  ratings.forEach((r) => {
    map[r._id] = r.avg.toFixed(2);
  });
  res.json(map);
});

app.put("/api/reviews/:id", auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || review.userId.toString() !== req.user.userId)
    return res.status(403).json({ error: "Forbidden" });
  Object.assign(review, req.body);
  await review.save();
  res.json({ message: "Review updated" });
});

app.delete("/api/reviews/:id", auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || review.userId.toString() !== req.user.userId)
    return res.status(403).json({ error: "Forbidden" });
  await review.deleteOne();
  res.json({ message: "Review deleted" });
});

app.get("/api/my-reviews", auth, async (req, res) => {
  const reviews = await Review.find({ userId: req.user.userId }).sort({
    createdAt: -1,
  });
  res.json(reviews);
});

app.listen(process.env.PORT || 5000);
