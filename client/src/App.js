import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState(1);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

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
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          response.data.some(reservedSeat => reservedSeat.number === seat.number)
            ? { ...seat, status: 'booked', reservedBy: username }
            : seat
        )
      );
      setMessage(`Successfully reserved ${numSeats} seats for ${username}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    }
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
      {message && <p className="message">{message}</p>}
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
    </div>
  );
};

export default App;
