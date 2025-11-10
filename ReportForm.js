import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ReportForm = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    faculty_name: 'Faculty of Information Communication Technology',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: '',
    actual_students_present: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'course_id') {
      const course = courses.find(c => c.id == e.target.value);
      setSelectedCourse(course);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/reports', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Report submitted successfully');
    } catch (err) {
      alert('Submission failed');
    }
  };

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-3">Back to Dashboard</Link>
      <h2>Submit Lecture Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Course</label>
          <select name="course_id" className="form-control" value={formData.course_id} onChange={handleChange} required>
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.course_name} ({course.course_code})</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>Faculty Name</label>
          <input type="text" name="faculty_name" className="form-control" value={formData.faculty_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Class Name</label>
          <input type="text" name="class_name" className="form-control" value={formData.class_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Week of Reporting</label>
          <input type="number" name="week_of_reporting" className="form-control" value={formData.week_of_reporting} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Date of Lecture</label>
          <input type="date" name="date_of_lecture" className="form-control" value={formData.date_of_lecture} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Venue</label>
          <input type="text" name="venue" className="form-control" value={formData.venue} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Scheduled Lecture Time</label>
          <input type="time" name="scheduled_time" className="form-control" value={formData.scheduled_time} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Topic Taught</label>
          <textarea name="topic_taught" className="form-control" value={formData.topic_taught} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Learning Outcomes</label>
          <textarea name="learning_outcomes" className="form-control" value={formData.learning_outcomes} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Lecturer's Recommendations</label>
          <textarea name="recommendations" className="form-control" value={formData.recommendations} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Total Number of Registered Students</label>
          <input type="number" className="form-control" value={selectedCourse ? selectedCourse.total_students : ''} readOnly />
        </div>
        <div className="mb-3">
          <label>Actual Number of Students Present</label>
          <input type="number" name="actual_students_present" className="form-control" value={formData.actual_students_present} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;
