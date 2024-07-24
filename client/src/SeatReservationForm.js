import React, { useState } from 'react';

const SeatReservationForm = ({ onReserve }) => {
    const [numSeats, setNumSeats] = useState(1);
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onReserve(username, numSeats);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </label>
            <label>
                Number of Seats:
                <input
                    type="number"
                    min="1"
                    value={numSeats}
                    onChange={(e) => setNumSeats(e.target.value)}
                />
            </label>
            <button type="submit">Reserve</button>
        </form>
    );
};

export default SeatReservationForm;
