import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch bookings with payment info
  const fetchBookings = async () => {
    try {
      const res = await API.get('/payments'); // 👈 bookings + payment populated
      setBookings(res.data.data || []);
    } catch {
      alert('Failed to load payments');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const bookingBills = useMemo(() => {
    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.bookingDate || left.createdAt || 0).getTime();
      const rightTime = new Date(right.bookingDate || right.createdAt || 0).getTime();
      if (leftTime !== rightTime) return leftTime - rightTime;
      return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
    });

    const outstandingByStudent = new Map();
    const bills = {};

    sorted.forEach((booking) => {
      const studentId = booking.studentId?._id || booking.studentId;
      const paid = booking.paymentId?.status === 'paid';
      const currentAmount = Number(booking.paymentAmount) || Number(booking.shiftId?.price) || 0;
      const previousDue = outstandingByStudent.get(studentId) || 0;
      const totalPayable = previousDue + currentAmount;

      bills[booking._id] = {
        currentAmount,
        previousDue,
        totalPayable
      };

      if (booking.status === 'cancelled' || paid) {
        outstandingByStudent.set(studentId, 0);
      } else {
        outstandingByStudent.set(studentId, totalPayable);
      }
    });

    return bills;
  }, [bookings]);

  const selectedBill = selectedBooking ? bookingBills[selectedBooking._id] : null;

  // 🔹 Create payment
  const submitPayment = async () => {
  try {
    setLoading(true);

    await API.post('/payments', {
      bookingId: selectedBooking._id,
      method
    });


    alert('✅ Payment successful');
    setSelectedBooking(null);
    fetchBookings();

  } catch (err) {
    alert(err.response?.data?.message || 'Payment failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Payments</h2>

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
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{b.studentId?.name}</td>
              <td>{b.seatId?.seatNo}</td>
              <td>{b.shiftId?.shiftName}</td>
              <td>
                {b.paymentId?.status === 'paid'
                  ? 'Paid'
                  : b.paymentId?.status === 'cancelled'
                  ? 'Cancelled'
                  : `Due (${formatCurrency(bookingBills[b._id]?.totalPayable)})`}
              </td>
              <td>
                {b.paymentId?.status === 'paid' ? (
                  <span style={{ color: 'green' }}>✅ Paid</span>
                ) : b.paymentId?.status === 'cancelled' ? (
                  <span style={{ color: 'gray' }}>Cancelled</span>
                ) : (
                  <button onClick={() => setSelectedBooking(b)}>
                    Pay {formatCurrency(bookingBills[b._id]?.totalPayable)}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 PAYMENT MODAL */}
      {selectedBooking && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Confirm Payment</h3>

            <p><b>Student:</b> {selectedBooking.studentId.name}</p>
            <p><b>Seat:</b> {selectedBooking.seatId.seatNo}</p>
            <p><b>Shift:</b> {selectedBooking.shiftId.shiftName}</p>
            <p><b>Current Fee:</b> {formatCurrency(selectedBill?.currentAmount)}</p>
            <p><b>Previous Due:</b> {formatCurrency(selectedBill?.previousDue)}</p>
            <p><b>Total Payable:</b> {formatCurrency(selectedBill?.totalPayable)}</p>

            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>

            <div style={{ marginTop: 15 }}>
              <button onClick={submitPayment} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modal = {
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  width: 320
};

export default Payments;
