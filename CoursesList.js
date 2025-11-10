import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleEdit = (courseId) => {
    navigate(`/edit-course/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(courses.filter(course => course.id !== courseId));
        alert('Course deleted successfully');
      } catch (error) {
        alert('Failed to delete course');
      }
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, please log in');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(res.data);
      } catch (error) {
        console.error('Error fetching courses:', error.response?.data || error.message);
        // Optionally, redirect to login or show error message
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mt-5">
      <Link to="/" className="btn btn-secondary mb-3">Back to Dashboard</Link>
      <h2>Courses</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Course Code</th>
            <th>Semester</th>
            <th>Department</th>
            <th>Total Students</th>
            <th>Lecturer</th>
            {user && user.role === 'pl' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.course_name}</td>
              <td>{course.course_code}</td>
              <td>{course.semester}</td>
              <td>{course.department}</td>
              <td>{course.total_students}</td>
              <td>{course.lecturer_name || 'Not assigned'}</td>
              {user && user.role === 'pl' && (
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(course.id)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesList;
