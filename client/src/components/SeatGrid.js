// import React, { useEffect, useState } from 'react';

// const SeatGrid = () => {
//   const [seats, setSeats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [availableSeats, setAvailableSeats] = useState(0);

//   useEffect(() => {
//     fetch('http://localhost:5000/seats')
//       .then(response => response.json())
//       .then(data => {
//         setSeats(data.seats);
//         setAvailableSeats(data.availableSeats);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching seats:', error);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h3>Available Seats: {availableSeats}</h3>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
//         {seats.map((seat, index) => (
//           <div
//             key={index}
//             style={{
//               width: '50px',
//               height: '50px',
//               backgroundColor: seat === null ? 'green' : 'red',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white'
//             }}
//           >
//             {index + 1}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from 'react';

const SeatGrid = () => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availableSeats, setAvailableSeats] = useState(0);
    const [numSeats, setNumSeats] = useState(1);

    useEffect(() => {
        fetch('http://localhost:5000/seats')
            .then(response => response.json())
            .then(data => {
                setSeats(data.seats);
                setAvailableSeats(data.availableSeats);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching seats:', error);
                setLoading(false);
            });
    }, []);

    const handleBooking = () => {
        if (numSeats < 1 || numSeats > 7) {
            alert('You can book between 1 and 7 seats only.');
            return;
        }
        fetch('http://localhost:5000/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numSeats }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                }
                setSeats(data.seats);
                setAvailableSeats(data.availableSeats);
            })
            .catch(error => console.error('Error booking seats:', error));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div>
                <label>
                    Number of seats to book (Min 1 to max of 7 seats can  be booked):
                    <input
                        type="number"
                        value={numSeats}
                        onChange={(e) => setNumSeats(e.target.value === '' ? '' : Math.abs(Number(e.target.value)))}
                    />

                </label>
                <button onClick={handleBooking}>Book Seats</button>
            </div>
            <h3>Available Seats: {availableSeats}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {seats.map((seat, index) => (
                    <div
                        key={index}
                        style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: seat === null ? 'green' : 'red',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default SeatGrid;


