import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Seat.css';

const Seat = () => {
    const [seats, setSeats] = useState([]);
    const [numSeats, setNumSeats] = useState(1);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [bookedSeats, setBookedSeats] = useState([]);
    const [recentlyBookedSeats, setRecentlyBookedSeats] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [inputsDisabled, setInputsDisabled] = useState(false);

    useEffect(() => {
        const fetchSeats = async () => {
            const response = await axios.get('/api/seats');
            setSeats(response.data);
        };
        fetchSeats();
    }, []);

    const handleReserve = async () => {
        try {
            if (username === "") {
                toast.error('Please enter a username to book seats');
                return;
            }

            // Disable inputs for 5 seconds
            setInputsDisabled(true);
            setTimeout(() => {
                setInputsDisabled(false);
            }, 6500);

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
            setRecentlyBookedSeats(reservedSeats.map(seat => seat.number));
            setMessage(`Successfully reserved ${numSeats} seat(s) for ${username}`);
            toast.success('Booking Successful 🏆');

            // Clear highlight after 5 seconds
            setTimeout(() => {
                setRecentlyBookedSeats([]);
            }, 6500);

            // Reset the message after 5 seconds
            setTimeout(() => {
                setMessage('');
            }, 6500);
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
            toast.error(error.response?.data?.error || 'An error occurred');

            // Reset the message after 5 seconds
            setTimeout(() => {
                setMessage('');
            }, 6500);

            // Re-enable inputs in case of an error
            setTimeout(() => {
                setInputsDisabled(false);
            }, 6500);
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
                    disabled={inputsDisabled}
                />
                <input
                    type="number"
                    placeholder="Number of Seats"
                    value={numSeats}
                    onChange={(e) => setNumSeats(parseInt(e.target.value))}
                    min="1"
                    max="7"
                    disabled={inputsDisabled}
                />
                <button
                    onClick={handleReserve}
                    disabled={inputsDisabled}
                    className={inputsDisabled ? 'disabled' : ''}
                >
                    Reserve
                </button>
            </div>
            {message && (
                <p className="message">
                    Successfully reserved <span className="bold">{numSeats}</span> seat(s) for <span className="bold">{username}</span>.
                    <button onClick={seatsBooked}>Booked Seats</button>
                </p>
            )}
            <div className="seat-map">
                {seats.map(seat => (
                    <div
                        key={seat.number}
                        className={`seat ${seat.status} ${recentlyBookedSeats.includes(seat.number) ? 'highlight' : ''}`}
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
            <ToastContainer position="top-center" />
        </div>
    );
};

export default Seat;
