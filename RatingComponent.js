import React, { useState } from 'react';
import axios from 'axios';

const RatingComponent = ({ reportId }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/users/rate', { report_id: reportId, rating, comments }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Rating submitted successfully');
      setRating(0);
      setComments('');
    } catch (err) {
      alert('Failed to submit rating');
    }
  };

  return (
    <div className="mt-3">
      <h5>Rate this Report</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Rating (1-5)</label>
          <select className="form-control" value={rating} onChange={(e) => setRating(e.target.value)} required>
            <option value="">Select Rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Comments</label>
          <textarea className="form-control" value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-success">Submit Rating</button>
      </form>
    </div>
  );
};

export default RatingComponent;
