// import modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

// load .env variables
dotenv.config();

// db import
const connectDB = require('./config/db');

// express app
const app = express();
app.use(cors());
app.use(express.json()); // IMPORTANT FIX

// routes
app.use('/api/auth', authRoutes);

// connect to database
connectDB();

// test route
app.get('/', (req, res) => {
    res.send("Neura backend is running 🚀");
});

// server listen
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("neura backend server is running at port:", port);
});
