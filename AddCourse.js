import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AddCourse = () => {
  const [lecturers, setLecturers] = useState([]);
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    semester: 1,
    department: 'Faculty of Information Communication Technology',
    total_students: '',
    assigned_lecturer_id: ''
  });

  useEffect(() => {
    const fetchLecturers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLecturers(res.data.filter(user => user.role === 'lecturer'));
    };
    fetchLecturers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/courses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course added successfully');
    } catch (err) {
      alert('Failed to add course');
    }
  };

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-3">Back to Dashboard</Link>
      <h2>Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Course Name</label>
          <select name="course_name" className="form-control" value={formData.course_name} onChange={handleChange} required>
            <option value="">Select Course</option>
            <option value="Diploma in Information Technology">Diploma in Information Technology</option>
            <option value="Diploma in Business Information Technology">Diploma in Business Information Technology</option>
            <option value="Bsc Degree in Business Information Technology">Bsc Degree in Business Information Technology</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Course Code</label>
          <input type="text" name="course_code" className="form-control" value={formData.course_code} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Semester</label>
          <input type="number" name="semester" className="form-control" value={formData.semester} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Department</label>
          <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Total Students</label>
          <input type="number" name="total_students" className="form-control" value={formData.total_students} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Assigned Lecturer</label>
          <select name="assigned_lecturer_id" className="form-control" value={formData.assigned_lecturer_id} onChange={handleChange} required>
            <option value="">Select Lecturer</option>
            {lecturers.map(lecturer => (
              <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Add Course</button>
      </form>
    </div>
  );
};

export default AddCourse;
