# Money Guard

Money Guard is a full-stack personal finance application for tracking income and expenses.

The interface is based on the Money Guard Figma design and includes responsive layouts for desktop, tablet and mobile.

## Features

- User registration
- User login/logout
- JWT authentication
- Password hashing
- Protected routes
- Add transactions
- Edit transactions
- Delete transactions
- Income and expense tracking
- Balance calculation
- Statistics by month and year
- Expense categories
- Responsive design

## Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Cookie Parser
- CORS

## Project Structure

```text
money-guard/
├── src/
│   ├── assets/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
│
├── .env.example
├── .gitignore
└── README.md
```
