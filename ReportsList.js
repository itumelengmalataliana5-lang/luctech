import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RatingComponent from './RatingComponent';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    };
    fetchReports();
  }, []);

  const handleFeedbackChange = (id, value) => {
    setFeedback({ ...feedback, [id]: value });
  };

  const submitFeedback = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/reports/${id}/feedback`, { feedback: feedback[id] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Feedback submitted');
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-3">Back to Dashboard</Link>
      <h2>Reports</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Lecturer</th>
            <th>Course</th>
            <th>Date</th>
            <th>Topic</th>
            <th>Students Present</th>
            <th>PRL Feedback</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.lecturer_name}</td>
              <td>{report.course_name}</td>
              <td>{report.date_of_lecture}</td>
              <td>{report.topic_taught}</td>
              <td>{report.actual_students_present}</td>
              <td>{report.prl_feedback || 'No feedback'}</td>
              <td>
                {JSON.parse(localStorage.getItem('user')).role === 'prl' && !report.prl_feedback && (
                  <>
                    <textarea
                      className="form-control mb-2"
                      placeholder="Add feedback"
                      value={feedback[report.id] || ''}
                      onChange={(e) => handleFeedbackChange(report.id, e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => submitFeedback(report.id)}>Submit Feedback</button>
                  </>
                )}
                <RatingComponent reportId={report.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsList;
