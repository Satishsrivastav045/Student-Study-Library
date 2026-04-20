import { useEffect, useState } from 'react';
import API from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'booked');

  return (
    <div style={{ padding: 20 }}>
      <h2>Bookings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table width="100%" border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Student</th>
              <th>Seat</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {activeBookings.map(b => (
              <tr key={b._id}>
                <td>
                  {b.studentId?.name || '-'}
                  {b.status === 'cancelled' && (
                    <span style={{ marginLeft: 8, color: 'gray', fontSize: 12 }}>
                      (Cancelled)
                    </span>
                  )}
                </td>
                <td>{b.seatId?.seatNo}</td>
                <td>{b.shiftId?.shiftName}</td>
                <td>{b.status}</td>
                <td>
                  {b.paymentId?.status === 'paid'
                    ? 'Paid'
                    : b.paymentId?.status === 'cancelled'
                    ? 'Cancelled'
                    : 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bookings;
