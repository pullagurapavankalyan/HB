import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

const ManagerReviews = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [replyMap, setReplyMap] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reviews/manager');
      setReviews(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load manager reviews', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReplyChange = (id, value) => {
    setReplyMap(prev => ({ ...prev, [id]: value }));
  };

  const submitReply = async (id) => {
    const message = (replyMap[id] || '').trim();
    if (!message) return alert('Reply cannot be empty');
    try {
      const res = await api.put(`/reviews/${id}/reply`, { message });
      // update local list
      setReviews((prev) => prev.map(r => r._id === id ? res.data.data || res.data : r));
      setReplyMap((p) => ({ ...p, [id]: '' }));
      alert('Reply saved');
    } catch (err) {
      console.error('Reply failed', err);
      alert(err.response?.data?.message || 'Failed to save reply');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Hotel Reviews</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {reviews.length === 0 && <div className="text-muted">No reviews yet for your hotels.</div>}
      {reviews.map((r) => (
        <div key={r._id} className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="mb-1">{r.userId?.name || 'Guest'}</h5>
                <div className="text-muted small">{r.hotelId?.hotelName} • {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-end">
                <div className="badge bg-warning text-dark">{r.rating} ★</div>
              </div>
            </div>
            <p className="mt-3">{r.comment}</p>

            {r.reply?.message ? (
              <div className="border rounded p-2 bg-light">
                <strong>Reply:</strong>
                <div className="small text-muted">{r.reply.message}</div>
                <div className="small text-muted">{r.reply.repliedAt ? new Date(r.reply.repliedAt).toLocaleString() : ''}</div>
              </div>
            ) : (
              <div className="mt-2">
                <textarea className="form-control mb-2" placeholder="Write a reply..." value={replyMap[r._id] || ''} onChange={(e) => handleReplyChange(r._id, e.target.value)} />
                <button className="btn btn-sm btn-primary" onClick={() => submitReply(r._id)}>Reply</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManagerReviews;
