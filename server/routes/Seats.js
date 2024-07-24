const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const User = require('../models/User');
const mongoose = require('mongoose')

// Initialize seats
const initializeSeats = async () => {
    const count = await Seat.countDocuments();
    if (count === 0) {
        const seats = [];
        const totalSeats = 80;
        const seatsPerRow = 7;
        const fullRows = Math.floor(totalSeats / seatsPerRow);
        const lastRowSeats = totalSeats % seatsPerRow;

        let seatNumber = 1;
        for (let i = 0; i < fullRows; i++) {
            for (let j = 0; j < seatsPerRow; j++) {
                seats.push({ number: seatNumber, status: 'available', reservedBy: null });
                seatNumber++;
            }
        }

        for (let k = 0; k < lastRowSeats; k++) {
            seats.push({ number: seatNumber, status: 'available', reservedBy: null });
            seatNumber++;
        }

        await Seat.insertMany(seats);
    }
};

initializeSeats();

// Get seat status
router.get('/', async (req, res) => {
    const seats = await Seat.find();
    res.json(seats);
});
router.post('/reset', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Seat.updateMany(
            {},
            { $set: { status: 'available', reservedBy: null } },
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'All seats have been reset successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Reserve seats
router.post('/reserve', async (req, res) => {
    const { username, numSeats } = req.body;

    if (numSeats < 1 || numSeats > 7) {
        return res.status(400).json({ error: 'yOU ' });
    }

    const user = await User.findOneAndUpdate(
        { username },
        { username },
        { upsert: true, new: true }
    );

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const availableSeats = await Seat.find({ status: 'available' }).session(session);
        if (availableSeats.length < numSeats) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        let reservedSeats = [];
        for (let i = 0; i < availableSeats.length; i++) {
            const seat = availableSeats[i];
            const row = Math.floor((seat.number - 1) / 7);
            const rowSeats = availableSeats.slice(i, i + numSeats);
            if (rowSeats.length === numSeats && rowSeats.every(s => Math.floor((s.number - 1) / 7) === row)) {
                reservedSeats = rowSeats;
                break;
            }
        }

        if (reservedSeats.length === 0) {
            reservedSeats = availableSeats.slice(0, numSeats);
        }

        await Seat.updateMany(
            { number: { $in: reservedSeats.map(s => s.number) } },
            { status: 'booked', reservedBy: user.username }
        ).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json(reservedSeats);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;
