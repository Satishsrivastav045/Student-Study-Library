import { useEffect, useState } from 'react';
import API from '../services/api';

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    row: 'A',
    startColumn: 1,
    totalSeats: 20,
    status: 'available'
  });

  const loadSeats = async () => {
    setLoading(true);
    const res = await API.get('/seats');
    setSeats(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSeats();
  }, []);

  const bulkCreate = async () => {
    try {
      await API.post('/seats/bulk', form);
      alert('Seats created');
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/seats/${id}`, { status });
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const deleteSeat = async (id) => {
    if (!window.confirm('Delete this seat?')) return;
    try {
      await API.delete(`/seats/${id}`);
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seat Management</h2>

      {/* BULK CREATE */}
      <div style={box}>
        <input
          autoComplete="off"
          placeholder="Row"
          value={form.row}
          onChange={e => setForm({ ...form, row: e.target.value })}
        />

        <input
          type="number"
          autoComplete="off"
          placeholder="Start Column"
          value={form.startColumn}
          onChange={e => setForm({ ...form, startColumn: e.target.value })}
        />

        <input
          type="number"
          autoComplete="off"
          placeholder="Total Seats"
          value={form.totalSeats}
          onChange={e => setForm({ ...form, totalSeats: e.target.value })}
        />

        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
        >
          <option value="available">Available</option>
          <option value="girls_only">Girls Only</option>
          <option value="maintenance">Maintenance</option>
          <option value="blocked">Blocked</option>
        </select>

        <button onClick={bulkCreate}>Create Seats</button>
      </div>

      {/* TABLE */}
      {loading ? <p>Loading...</p> : (
        <table style={table}>
          <thead>
            <tr>
              <th>Seat</th>
              <th>Row</th>
              <th>Column</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {seats.map(seat => (
              <tr key={seat._id} style={rowStyle}>
                <td>{seat.seatNo}</td>
                <td>{seat.row}</td>
                <td>{seat.column}</td>
                <td>
                  <span style={badge(seat.status)}>
                    {seat.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={seat.status}
                    onChange={e => updateStatus(seat._id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="girls_only">Girls Only</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>

                  <button
                    style={deleteBtn}
                    onClick={() => deleteSeat(seat._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* 🎨 STYLES */
const box = {
  display: 'flex',
  gap: 10,
  padding: 15,
  border: '1px solid #ddd',
  borderRadius: 10,
  marginBottom: 20
};

const table = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 10px'
};

const rowStyle = {
  background: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  borderRadius: 8
};

const badge = (status) => ({
  padding: '6px 12px',
  borderRadius: 20,
  color: '#fff',
  fontSize: 13,
  background:
    status === 'available' ? '#22c55e' :
    status === 'girls_only' ? '#ec4899' :
    status === 'maintenance' ? '#f59e0b' :
    status === 'blocked' ? '#6b7280' :
    '#2563eb' // booked
});

const deleteBtn = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer'
};

export default Seats;
