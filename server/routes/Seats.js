// const express = require('express');
// const router = express.Router();
// const Seat = require('../models/Seat');
// const User = require('../models/User');
// const mongoose = require('mongoose');

// // Initialize seats
// const initializeSeats = async () => {
//     const count = await Seat.countDocuments();
//     if (count === 0) {
//         const seats = [];
//         const totalSeats = 80;
//         const seatsPerRow = 7;
//         const fullRows = Math.floor(totalSeats / seatsPerRow);
//         const lastRowSeats = totalSeats % seatsPerRow;

//         let seatNumber = 1;
//         for (let i = 0; i < fullRows; i++) {
//             for (let j = 0; j < seatsPerRow; j++) {
//                 seats.push({ number: seatNumber, status: 'available', reservedBy: null });
//                 seatNumber++;
//             }
//         }

//         if (lastRowSeats > 0) {
//             for (let k = 0; k < lastRowSeats; k++) {
//                 seats.push({ number: seatNumber, status: 'available', reservedBy: null });
//                 seatNumber++;
//             }
//         }

//         await Seat.insertMany(seats);
//     }
// };

// initializeSeats();

// // Get seat status
// router.get('/', async (req, res) => {
//     const seats = await Seat.find();
//     res.json(seats);
// });

// // Reset seats
// router.post('/reset', async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         await Seat.updateMany(
//             {},
//             { $set: { status: 'available', reservedBy: null } },
//             { session }
//         );
//         await session.commitTransaction();
//         session.endSession();
//         res.json({ message: 'All seats have been reset successfully' });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });
// // Fill all seats
// router.post('/fill', async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         await Seat.updateMany(
//             {},
//             { $set: { status: 'booked', reservedBy: "admin" } },
//             { session }
//         );
//         await session.commitTransaction();
//         session.endSession();
//         res.json({ message: 'All seats have been booked successfully' });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });

// const swap = (arr, i, j) => {
//     [arr[i], arr[j]] = [arr[j], arr[i]];
// };

// //fill partial no of seats
// router.post('/partialfilling', async (req, res) => {
//     const { username, numSeats } = req.body;
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         // Check if there are enough available seats
//         const totalSeatsAvailable = await Seat.countDocuments({ status: 'available' }).session(session);
//         if (totalSeatsAvailable < numSeats) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ error: 'Not enough seats available!' });
//         }

//         // Retrieve available seats
//         const availableSeats = await Seat.find({ status: 'available' }).session(session);

//         // Shuffle the available seats to randomly select
//         for (let i = availableSeats.length - 1; i > 0; i--) {
//             //generating a random no from 1 to i
//             const j = Math.floor(Math.random() * (i + 1));
//             swap(availableSeats, i, j);
//         }

//         // Select the first `numSeats` seats from the shuffled list
//         const seatsToBook = availableSeats.slice(0, numSeats);

//         // Update the status of the selected seats
//         await Seat.updateMany(
//             { number: { $in: seatsToBook.map(s => s.number) } },
//             { $set: { status: 'booked', reservedBy: username } },
//         ).session(session);

//         await session.commitTransaction();
//         session.endSession();
//         res.json({ message: 'Seats have been booked successfully', bookedSeats: seatsToBook });
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });


// // Reserve seats
// router.post('/reserve', async (req, res) => {
//     const { username, numSeats } = req.body;

//     if (numSeats < 1 || numSeats > 7) {
//         return res.status(400).json({ error: 'Invalid number of seats requested' });
//     }

//     const user = await User.findOneAndUpdate(
//         { username },
//         { username },
//         { upsert: true, new: true }
//     );

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const totalSeatsAvailable = await Seat.countDocuments({ status: 'available' }).session(session);

//         if (totalSeatsAvailable < numSeats) {
//             return res.status(400).json({ error: 'Enough seats are not available!' });
//         }

//         let reservedSeats = [];
//         const existingReservations = await Seat.find({ reservedBy: user.username }).session(session);
//         const existingRows = new Set(existingReservations.map(seat => Math.floor((seat.number - 1) / 7)));

//         // Check for seats in the same row or nearby rows
//         if (existingReservations.length > 0) {
//             const availableSeats = await Seat.find({ status: 'available' }).session(session);

//             const findSeatsInRows = (rowsToCheck) => {
//                 for (const row of rowsToCheck) {
//                     const rowSeats = availableSeats.filter(seat => Math.floor((seat.number - 1) / 7) === row);
//                     if (rowSeats.length >= numSeats) {
//                         const consecutiveSeats = [];
//                         for (let i = 0; i < rowSeats.length; i++) {
//                             if (consecutiveSeats.length === numSeats) break;
//                             if (i === 0 || rowSeats[i].number === consecutiveSeats[consecutiveSeats.length - 1].number + 1) {
//                                 consecutiveSeats.push(rowSeats[i]);
//                             } else {
//                                 consecutiveSeats.length = 0;
//                             }
//                         }
//                         if (consecutiveSeats.length === numSeats) {
//                             reservedSeats = consecutiveSeats;
//                             return true;
//                         }
//                     }
//                 }
//                 return false;
//             };

//             if (!findSeatsInRows(Array.from(existingRows).concat([Array.from(existingRows).map(row => row - 1), Array.from(existingRows).map(row => row + 1)]).flat())) {
//                 const availableSeats = await Seat.find({ status: 'available' }).session(session);
//                 if (availableSeats.length < numSeats) {
//                     await session.abortTransaction();
//                     session.endSession();
//                     return res.status(400).json({ error: 'Not enough seats available' });
//                 }

//                 reservedSeats = availableSeats.slice(0, numSeats);
//             }
//         } else {
//             reservedSeats = await Seat.find({ status: 'available' }).limit(numSeats).session(session);
//             if (reservedSeats.length < numSeats) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 return res.status(400).json({ error: 'Not enough seats available' });
//             }
//         }

//         await Seat.updateMany(
//             { number: { $in: reservedSeats.map(s => s.number) } },
//             { status: 'booked', reservedBy: user.username }
//         ).session(session);

//         await session.commitTransaction();
//         session.endSession();

//         res.json(reservedSeats);
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });

// module.exports = router;


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

//fill partial no of seats
router.post('/partialfilling', async (req, res) => {
    const { username, numSeats } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if there are enough available seats
        const totalSeatsAvailable = await Seat.countDocuments({ status: 'available' }).session(session);
        if (totalSeatsAvailable == 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'No more Seats are vacant!' });
        }
        if (totalSeatsAvailable < numSeats) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Not enough seats available!' });
        }

        // Retrieve available seats
        const kahliSeats = await Seat.find({ status: 'available' }).session(session);

        // Shuffle the available seats to randomly select
        for (let i = kahliSeats.length - 1; i > 0; i--) {
            //generating a random no from 1 to i
            const j = Math.floor(Math.random() * (i + 1));
            swap(kahliSeats, i, j);
        }

        // Select the first `numSeats` seats from the shuffled list
        const seatsToBook = kahliSeats.slice(0, numSeats);

        // Update the status of the selected seats
        await Seat.updateMany(
            { number: { $in: seatsToBook.map(s => s.number) } },
            { $set: { status: 'booked', reservedBy: username } },
        ).session(session);

        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Seats have been booked successfully', bookedSeats: seatsToBook });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'An error occurred' });
    }
});



// Fill all seats
router.post('/fill', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Seat.updateMany(
            {},
            { $set: { status: 'booked', reservedBy: "admin" } },
            { session }
        );
        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'All seats have been booked successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: 'An error occurred' });
    }
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
        return res.status(400).json({ error: 'Invalid number of seats requested' });
    }

    const user = await User.findOneAndUpdate(
        { username },
        { username },
        { upsert: true, new: true }
    );

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingReservations = await Seat.find({ reservedBy: user.username }).session(session);
        let reservedSeats = [];

        if (existingReservations.length > 0) {
            const existingRows = new Set(existingReservations.map(seat => Math.floor((seat.number - 1) / 7)));
            const availableSeats = await Seat.find({ status: 'available' }).session(session);

            // Check for seats in the same row or nearby rows
            for (let i = 0; i < availableSeats.length; i++) {
                const seat = availableSeats[i];
                const row = Math.floor((seat.number - 1) / 7);

                if (existingRows.has(row)) {
                    const rowSeats = availableSeats.slice(i, i + numSeats);
                    if (rowSeats.length === numSeats && rowSeats.every(s => Math.floor((s.number - 1) / 7) === row)) {
                        reservedSeats = rowSeats;
                        break;
                    }
                }
            }

            // If no seats found in the same row, try to find in nearby rows
            if (reservedSeats.length === 0) {
                const nearbyRows = Array.from(existingRows).flatMap(row => [row - 1, row, row + 1]);
                for (let i = 0; i < availableSeats.length; i++) {
                    const seat = availableSeats[i];
                    const row = Math.floor((seat.number - 1) / 7);

                    if (nearbyRows.includes(row)) {
                        const rowSeats = availableSeats.slice(i, i + numSeats);
                        if (rowSeats.length === numSeats && rowSeats.every(s => Math.floor((s.number - 1) / 7) === row)) {
                            reservedSeats = rowSeats;
                            break;
                        }
                    }
                }
            }
        }

        // If no suitable seats found or no existing bookings, proceed with normal booking
        if (reservedSeats.length === 0) {
            const availableSeats = await Seat.find({ status: 'available' }).session(session);
            if (availableSeats.length < numSeats) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Not enough seats available' });
            }

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