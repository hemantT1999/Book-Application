import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userBookRatings, setUserBookRatings] = useState({});
  const [avgBookRatings, setAvgBookRatings] = useState({});
  const [page, setPage] = useState(1);
  const [myReviews, setMyReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Enhanced Floating particles component
  const FloatingParticles = () => (
    <div className="particles">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="particle"></div>
      ))}
    </div>
  );

  function fetchUserRatings() {
    axios
      .get(`${API}/user-book-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserBookRatings(res.data));
  }

  function fetchMyReviews() {
    axios
      .get(`${API}/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyReviews(res.data));
  }

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/reviews`)
      .then((res) => setReviews(res.data))
      .finally(() => setLoading(false));
    if (token) {
      fetchUserRatings();
      fetchMyReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    axios
      .get(`${API}/book-avg-ratings`)
      .then((res) => setAvgBookRatings(res.data));
  }, [reviews]);

  function handleAuth(e) {
    e.preventDefault();
    const url = isLogin ? "/login" : "/signup";
    axios
      .post(API + url, { username, password })
      .then((res) => {
        if (res.data.token) setToken(res.data.token);
        setUsername("");
        setPassword("");
        setSuccessMsg(
          isLogin ? "🎉 Welcome back!" : "🎊 Account created successfully!"
        );
        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || "❌ Authentication failed");
        setTimeout(() => setErrorMsg(""), 3000);
      });
  }

  function handleReview(e) {
    e.preventDefault();
    if (editingReviewId) {
      axios
        .put(
          `${API}/reviews/${editingReviewId}`,
          { title, author, review, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setTitle("");
          setAuthor("");
          setReview("");
          setRating(1);
          setEditingReviewId(null);
          setSuccessMsg("✨ Review updated successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
          axios.get(`${API}/reviews`).then((res) => setReviews(res.data));
          axios
            .get(`${API}/my-reviews`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setMyReviews(res.data));
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.error || "❌ Error updating review");
          setTimeout(() => setErrorMsg(""), 3000);
        });
    } else {
      axios
        .post(
          `${API}/reviews`,
          { title, author, review, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setTitle("");
          setAuthor("");
          setReview("");
          setRating(1);
          setSuccessMsg("🎉 Review submitted successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
          axios.get(`${API}/reviews`).then((res) => setReviews(res.data));
          axios
            .get(`${API}/my-reviews`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setMyReviews(res.data));
        })
        .catch((err) => {
          setErrorMsg(
            err.response?.data?.error || "❌ Error submitting review"
          );
          setTimeout(() => setErrorMsg(""), 3000);
        });
    }
  }

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout?")) {
      setToken("");
    }
  }

  function handleBookRating(bookId, value) {
    axios
      .post(
        `${API}/rate-book`,
        { bookId, rating: value },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchUserRatings();
        axios.get(`${API}/reviews`).then((res) => setReviews(res.data));
      })
      .catch(() => {
        setErrorMsg("❌ Error rating book");
        setTimeout(() => setErrorMsg(""), 3000);
      });
  }

  function loadMore() {
    setLoading(true);
    axios
      .get(`${API}/reviews?page=${page + 1}`)
      .then((res) => {
        setReviews([...reviews, ...res.data]);
        setPage(page + 1);
      })
      .finally(() => setLoading(false));
  }

  function handleEditReview(review) {
    setTitle(review.title);
    setAuthor(review.author);
    setReview(review.review);
    setRating(review.rating);
    setEditingReviewId(review._id);
  }

  function handleDeleteReview(id) {
    if (window.confirm("Are you sure you want to delete this review?")) {
      axios
        .delete(`${API}/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setReviews(reviews.filter((r) => r._id !== id));
          setMyReviews(myReviews.filter((r) => r._id !== id));
          setSuccessMsg("🗑️ Review deleted successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.error || "❌ Error deleting review");
          setTimeout(() => setErrorMsg(""), 3000);
        });
    }
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  const filteredReviews = reviews.filter(
    (r) => filterRating === 0 || r.rating === filterRating
  );

  if (!token) {
    return (
      <div className="app-container">
        <FloatingParticles />
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="auth-title">
              {isLogin ? "🌟 Welcome Back" : "🚀 Join Us"}
            </h2>
            <form onSubmit={handleAuth} className="auth-form">
              <div className="input-group">
                <input
                  className="form-input"
                  placeholder="👤 Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  className="form-input"
                  type="password"
                  placeholder="🔒 Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                {isLogin ? "🚀 Sign In" : "✨ Create Account"}
              </button>
            </form>
            {successMsg && (
              <div className="message message-success">{successMsg}</div>
            )}
            {errorMsg && (
              <div className="message message-error">{errorMsg}</div>
            )}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn-secondary"
            >
              {isLogin
                ? "Need an account? 📝 Sign up"
                : "Already have an account? 🔑 Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <FloatingParticles />
      <div className="main-container">
        <header className="app-header">
          <h1 className="app-title">📚 BookReview Universe</h1>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </header>

        <div className="review-form-container">
          <h2 className="section-title">
            {editingReviewId
              ? "✏️ Edit Your Review"
              : "✨ Share Your Literary Journey"}
          </h2>
          <form onSubmit={handleReview}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">📖 Book Title</label>
                <input
                  className="form-input"
                  placeholder="Enter the amazing book title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">👨‍💼 Author</label>
                <input
                  className="form-input"
                  placeholder="Who's the brilliant author?"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">💭 Your Review</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Share your thoughts, feelings, and insights about this book..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">⭐ Rating (1-5 stars)</label>
              <input
                className="form-input rating-input"
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              {editingReviewId ? "🔄 Update Review" : "🚀 Submit Review"}
            </button>
          </form>
        </div>

        {successMsg && (
          <div className="message message-success">{successMsg}</div>
        )}
        {errorMsg && <div className="message message-error">{errorMsg}</div>}

        <div className="reviews-section">
          <h2 className="section-title">🌟 Community Reviews</h2>

          <div className="stats-container">
            <div className="stat-card">📊 Average Rating: {avgRating} ⭐</div>
            <div className="stat-card">📚 Total Reviews: {reviews.length}</div>
            <div className="stat-card">
              👥 Active Readers:{" "}
              {new Set(reviews.map((r) => r.userId?.username)).size}
            </div>
          </div>

          <div className="filter-container">
            <label className="form-label">🔍 Filter by Rating: </label>
            <select
              className="filter-select"
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
            >
              <option value={0}>🌟 All Ratings</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {"⭐".repeat(n)} {n} Star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">🔄 Loading amazing reviews...</div>
          ) : (
            filteredReviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <div>
                    <div className="book-title">📖 {r.title}</div>
                    <div className="book-author">✍️ by {r.author}</div>
                  </div>
                  <div className="rating-display">⭐ {r.rating}/5</div>
                </div>

                <div className="review-content">💭 {r.review}</div>

                <div className="review-meta">
                  <span>👤 {r.userId?.username || "Anonymous Reader"}</span>
                  <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="rating-section">
                  <label>🌟 Your Rating: </label>
                  <select
                    className="rating-select"
                    value={userBookRatings[r._id] || ""}
                    onChange={(e) =>
                      handleBookRating(r._id, Number(e.target.value))
                    }
                    disabled={r.userId?.username === username}
                  >
                    <option value="">Rate this masterpiece</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {"⭐".repeat(n)} {n} Star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="avg-rating">
                    📈 Community: {avgBookRatings[r._id] || "N/A"}
                  </div>
                </div>

                {r.userId?.username === username && (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditReview(r)}
                      className="btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          <button onClick={loadMore} className="btn-load-more">
            🔄 Load More Amazing Reviews
          </button>
        </div>

        {myReviews.length > 0 && (
          <div className="reviews-section">
            <h2 className="section-title">📝 My Literary Contributions</h2>
            {myReviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <div>
                    <div className="book-title">📖 {r.title}</div>
                    <div className="book-author">✍️ by {r.author}</div>
                  </div>
                  <div className="rating-display">⭐ {r.rating}/5</div>
                </div>

                <div className="review-content">💭 {r.review}</div>

                <div className="review-meta">
                  <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleEditReview(r)}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    className="btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
