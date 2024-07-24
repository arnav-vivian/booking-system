const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    number: Number,
    status: String, // 'available' or 'booked'
    reservedBy: String, // User who reserved the seat
});

module.exports = mongoose.model('Seat', seatSchema);
