# Book Review App

A full stack application where users can register, log in, post reviews for books, and rate books. Built with React, Node.js, Express, and MongoDB.

---

## Features

- **Authentication:** Signup & login with JWT, bcrypt password hashing.
- **Book Reviews:** Add, edit, delete reviews (title, author, review, rating).
- **Book Ratings:** Any user can rate any book; average ratings are displayed.
- **Review List:** View all reviews, filter by rating, see reviewer name.
- **Profile:** See your own reviews.
- **Pagination:** Load more reviews.
- **Responsive UI:** Mobile-friendly, animated backgrounds.
- **Error Handling:** User-friendly error and success messages.

---

## Project Structure

```
book review app/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── ...
    ├── public/
    ├── package.json
    └── README.md
```

---

## .env.example (backend)

Copy this file to `.env` and fill in your values:

```
MONGO_URI=MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bookreviews
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## Running Locally

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
node server.js
```
The backend runs on [http://localhost:5000](http://localhost:5000).

### 2. Frontend

```bash
cd frontend
npm install
npm start
```
The frontend runs on [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

- `POST /api/signup` — Register new user
- `POST /api/login` — Login and get JWT token
- `POST /api/reviews` — Add a review (auth required)
- `PUT /api/reviews/:id` — Edit your review (auth required)
- `DELETE /api/reviews/:id` — Delete your review (auth required)
- `GET /api/reviews` — Get paginated reviews
- `GET /api/my-reviews` — Get your reviews
- `POST /api/rate-book` — Rate a book (auth required)
- `GET /api/user-book-ratings` — Get your ratings
- `GET /api/book-avg-ratings` — Get average ratings per book

---

## How It Works

- Register or log in to get started.
- After login, submit book reviews and rate any book.
- Edit or delete your own reviews.
- Filter reviews by rating, see average ratings, and load more reviews.
- All actions show clear success/error messages.

---

## License

MIT
