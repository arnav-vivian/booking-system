// import React, { useState, useEffect } from 'react';

// const SeatGrid = () => {
//     const [seats, setSeats] = useState([]);

//     useEffect(() => {
//         const fetchSeats = () => {
//             fetch('http://localhost:3001/api/seats')
//                 .then(response => response.json())
//                 .then(data => setSeats(data));
//         };

//         fetchSeats();
//         const interval = setInterval(fetchSeats, 5000);
//         return () => clearInterval(interval);
//     }, []);

//     const renderSeats = () => {
//         const rows = [];
//         for (let i = 0; i < seats.length; i += 7) {
//             rows.push(seats.slice(i, i + 7));
//         }
//         return rows.map((row, rowIndex) => (
//             <div key={rowIndex} className="row">
//                 {row.map((seat, seatIndex) => (
//                     <div
//                         key={seatIndex}
//                         className={`seat ${seat.status}`}
//                     >
//                         {seat.number}
//                     </div>
//                 ))}
//             </div>
//         ));
//     };

//     return (
//         <div className="seat-grid">
//             {renderSeats()}
//         </div>
//     );
// };

// export default SeatGrid;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Seats.css'; // Import your CSS file

const Seats = () => {
    const [seats, setSeats] = useState([]);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await axios.get('/api/seats'); // Adjust the endpoint as necessary
                setSeats(response.data);
            } catch (error) {
                console.error('Error fetching seats:', error);
            }
        };

        fetchSeats();
    }, []);

    const getSeatClass = (bookedBy) => {
        switch (bookedBy) {
            case 'user1':
                return 'seat user1';
            case 'user2':
                return 'seat user2';
            // Add more cases as needed
            default:
                return 'seat';
        }
    };

    return (
        <div className="seats-container">
            {seats.map(seat => (
                <div key={seat._id} className={getSeatClass(seat.bookedBy)}>
                    {seat.number}
                </div>
            ))}
        </div>
    );
};

export default Seats;
