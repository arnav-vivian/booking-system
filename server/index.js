const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const seatRoutes = require('./routes/Seats'); // Adjust the path if needed

require('dotenv').config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 500000
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Routes
app.use('/api/seats', seatRoutes);

// Dynamic port assignment for Vercel
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
