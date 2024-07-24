import React from 'react';
// import './Seat.css';

function Seat({ seat, index }) {
    return (
        <div className={`seat ${seat ? 'booked' : 'available'}`}>
            {index + 1}
        </div>
    );
}

export default Seat;
