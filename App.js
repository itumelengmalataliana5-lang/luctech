import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportsList from './components/ReportsList';
import CoursesList from './components/CoursesList';
import AddCourse from './components/AddCourse';
import EditCourse from './components/EditCourse';
import UsersList from './components/UsersList';
import Monitoring from './components/Monitoring';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute roles={['lecturer']}><ReportForm /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['prl', 'pl']}><ReportsList /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><CoursesList /></PrivateRoute>} />
          <Route path="/add-course" element={<PrivateRoute roles={['pl']}><AddCourse /></PrivateRoute>} />
          <Route path="/edit-course/:id" element={<PrivateRoute roles={['pl']}><EditCourse /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['pl']}><UsersList /></PrivateRoute>} />
          <Route path="/monitoring" element={<PrivateRoute><Monitoring /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
