import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-lg text-neutral-600">Welcome, {user.name} ({user.role})</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/monitoring"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
          >
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Monitoring</h3>
            <p className="text-neutral-600">View analytics and reports</p>
          </Link>

          {user.role === 'lecturer' && (
            <>
              <Link
                to="/report"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Submit Report</h3>
                <p className="text-neutral-600">Submit your course report</p>
              </Link>
              <Link
                to="/courses"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">My Courses</h3>
                <p className="text-neutral-600">View your assigned courses</p>
              </Link>
            </>
          )}

          {user.role === 'prl' && (
            <>
              <Link
                to="/reports"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">View Reports</h3>
                <p className="text-neutral-600">Review submitted reports</p>
              </Link>
              <Link
                to="/courses"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Courses</h3>
                <p className="text-neutral-600">Manage course information</p>
              </Link>
            </>
          )}

          {user.role === 'pl' && (
            <>
              <Link
                to="/reports"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">View Reports</h3>
                <p className="text-neutral-600">Review all reports</p>
              </Link>
              <Link
                to="/courses"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Courses</h3>
                <p className="text-neutral-600">Manage all courses</p>
              </Link>
              <Link
                to="/add-course"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Add Course</h3>
                <p className="text-neutral-600">Create new courses</p>
              </Link>
              <Link
                to="/users"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
              >
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Lecturers</h3>
                <p className="text-neutral-600">Manage lecturer accounts</p>
              </Link>
            </>
          )}

          {user.role === 'student' && (
            <Link
              to="/courses"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-neutral-200 hover:border-primary"
            >
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Courses</h3>
              <p className="text-neutral-600">View enrolled courses</p>
            </Link>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
