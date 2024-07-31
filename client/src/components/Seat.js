import React, { useEffect, useState, useRef } from 'react';
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
    const [isSeatsBooked, setIsSeatsBooked] = useState(false);
    const seatRefs = useRef({});

    useEffect(() => {
        const fetchSeats = async () => {
            const response = await axios.get('/api/seats');
            console.log("/api/seats successfull")
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

            // Disable inputs for 6.5 seconds
            setInputsDisabled(true);
            setTimeout(() => {
                setInputsDisabled(false);
            }, 6500);

            // Make the API request to reserve seats
            const response = await axios.post('/api/seats/reserve', { username, numSeats });
            const reservedSeats = response.data;

            if (response.status !== 200 || reservedSeats.length === 0) {
                const errorMessage = response.data.error || 'An error occurred or no seats are available';
                setMessage(errorMessage);
                setIsSeatsBooked(false);
                toast.error(errorMessage);
                return;
            }

            // Update seat states based on reserved seats
            setSeats(prevSeats =>
                prevSeats.map(seat =>
                    reservedSeats.some(reservedSeat => reservedSeat.number === seat.number)
                        ? { ...seat, status: 'booked', reservedBy: username }
                        : seat
                )
            );

            // Update booked seats for UI
            setBookedSeats(reservedSeats.map(seat => seat.number));
            setRecentlyBookedSeats(reservedSeats.map(seat => seat.number));
            setIsSeatsBooked(true);

            // Scroll to the booked seat
            if (reservedSeats.length > 0) {
                const firstBookedSeat = reservedSeats[0].number;
                seatRefs.current[firstBookedSeat]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Set success message and notify user
            setMessage(`Successfully reserved ${numSeats} seat(s) for ${username}`);
            toast.success('Booking Successful 🏆');
        } catch (error) {
            // Handle API errors
            const errorMessage = error.response?.data?.error || 'An error occurred';
            setMessage(errorMessage);
            setIsSeatsBooked(false);
            toast.error(errorMessage);
        } finally {
            setTimeout(() => {
                setRecentlyBookedSeats([]);
                setMessage('');
            }, 6500);
            // Re-enable inputs regardless of success or error
            setInputsDisabled(false);
        }
    };

    const seatsBooked = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setBookedSeats([]);
        setShowPopup(false);
    };

    return (
        <>
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
                        {message}
                        {isSeatsBooked && (
                            <button onClick={seatsBooked}>Booked Seats</button>
                        )}
                    </p>
                )}
                <div className="seat-map">
                    {seats.map(seat => (
                        <div
                            key={seat.number}
                            ref={el => seatRefs.current[seat.number] = el}
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
        </>
    );
};

export default Seat;
