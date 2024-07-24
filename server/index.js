
const cors = require('cors');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');  // Import mongoose


const app = express();
app.use(express.json());
app.use(cors());
const seatRoutes = require('./routes/Seats');

// Replace with your MongoDB Atlas connection string
const dbURI = 'mongodb+srv://admin:admin@cluster0.503m5xc.mongodb.net/train_seats?retryWrites=true&w=majority';

mongoose.connect(dbURI, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    serverSelectionTimeoutMS: 50000
})
    .then(() => console.log('Connected to MongoDB '))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use('/api/seats', seatRoutes);

app.listen(3001, () => {
    console.log('----------------Server is running on port 3001----------');
});
