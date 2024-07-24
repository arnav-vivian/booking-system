import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Seat.css';

const Seat = () => {
    const [seats, setSeats] = useState([]);
    const [numSeats, setNumSeats] = useState(1);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [bookedSeats, setBookedSeats] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchSeats = async () => {
            const response = await axios.get('/api/seats');
            setSeats(response.data);
        };
        fetchSeats();
    }, []);

    const handleReserve = async () => {
        try {
            const response = await axios.post('/api/seats/reserve', { username, numSeats });
            const reservedSeats = response.data;
            setSeats(prevSeats =>
                prevSeats.map(seat =>
                    reservedSeats.some(reservedSeat => reservedSeat.number === seat.number)
                        ? { ...seat, status: 'booked', reservedBy: username }
                        : seat
                )
            );
            setBookedSeats(reservedSeats.map(seat => seat.number));
            setMessage(`Successfully reserved ${numSeats} seats for ${username}`);
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
        }
    };

    const seatsBooked = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="app">
            <h1>Seat Reservation</h1>

            <div className="controls">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Number of Seats"
                    value={numSeats}
                    onChange={(e) => setNumSeats(parseInt(e.target.value))}
                    min="1"
                    max="7"
                />
                <button onClick={handleReserve}>Reserve</button>
            </div>
            {message && (
                <p className="message">
                    {message} <button onClick={seatsBooked}>Booked seats</button>
                </p>
            )}
            <div className="seat-map">
                {seats.map(seat => (
                    <div
                        key={seat.number}
                        className={`seat ${seat.status}`}
                        title={`Seat ${seat.number}`}
                    >
                        {seat.number}
                    </div>
                ))}
            </div>
            {showPopup && (
                <div className="overlay" onClick={closePopup}>
                    <div className="popup" onClick={(e) => e.stopPropagation()}>
                        <h2>Booked Seats</h2>
                        <p>{bookedSeats.join(', ')}</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Seat;
