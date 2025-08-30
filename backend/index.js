// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./apiRoutes'); // Import the API routes

// --- Initializations ---
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for your React app
app.use(cors({
  origin: '*' // In production, you should restrict this to your frontend's domain
}));

// Enable parsing of JSON bodies in requests
app.use(express.json());

// --- Database Connection ---
mongoose.set('strictQuery', false); // Prepare for Mongoose 7's default behavior

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

// --- API Routes ---
// Mount the API routes under the /api path
app.use('/api', apiRoutes);

// --- Global Error Handler ---
// A simple catch-all for unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong on the server!' });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
