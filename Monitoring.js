import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Monitoring = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        let analytics = {};

        if (user.role === 'student') {
          const coursesRes = await axios.get('http://localhost:5000/api/courses', { headers });
          const reportsRes = await axios.get('http://localhost:5000/api/reports', { headers });
          analytics.courses = coursesRes.data;
          analytics.enrolledCourses = coursesRes.data.length;
          analytics.completedCourses = Math.floor(coursesRes.data.length * 0.7);
          analytics.reports = reportsRes.data;
          analytics.ratings = [];

          // Fetch ratings for each report
          for (const report of reportsRes.data) {
            try {
              const ratingsRes = await axios.get(`http://localhost:5000/api/users/ratings/${report.id}`, { headers });
              analytics.ratings.push(...ratingsRes.data);
            } catch (err) {
              console.log(`No ratings for report ${report.id}`);
            }
          }
        } else if (user.role === 'lecturer') {
          const reportsRes = await axios.get('http://localhost:5000/api/reports', { headers });
          const coursesRes = await axios.get('http://localhost:5000/api/courses', { headers });
          analytics.reports = reportsRes.data;
          analytics.courses = coursesRes.data;
          analytics.submittedReports = reportsRes.data.length;
          analytics.pendingReports = Math.floor(reportsRes.data.length * 0.2);
          analytics.attendance = reportsRes.data.reduce((sum, r) => sum + r.actual_students_present, 0) / reportsRes.data.length || 0;

          // Fetch ratings for each report
          analytics.ratings = [];
          for (const report of reportsRes.data) {
            try {
              const ratingsRes = await axios.get(`http://localhost:5000/api/users/ratings/${report.id}`, { headers });
              analytics.ratings.push(...ratingsRes.data);
            } catch (err) {
              console.log(`No ratings for report ${report.id}`);
            }
          }
        } else if (user.role === 'prl') {
          const reportsRes = await axios.get('http://localhost:5000/api/reports', { headers });
          analytics.reports = reportsRes.data;
          analytics.feedbacks = reportsRes.data.filter(r => r.prl_feedback);
          analytics.reviewedReports = analytics.feedbacks.length;
          analytics.pendingReviews = reportsRes.data.length - analytics.reviewedReports;

          // Aggregate statistics
          const lecturerStats = {};
          reportsRes.data.forEach(report => {
            if (!lecturerStats[report.lecturer_id]) {
              lecturerStats[report.lecturer_id] = { name: report.lecturer_name, reports: 0, ratings: [] };
            }
            lecturerStats[report.lecturer_id].reports++;
          });

          // Fetch ratings for each report
          for (const report of reportsRes.data) {
            try {
              const ratingsRes = await axios.get(`http://localhost:5000/api/users/ratings/${report.id}`, { headers });
              lecturerStats[report.lecturer_id].ratings.push(...ratingsRes.data);
            } catch (err) {
              console.log(`No ratings for report ${report.id}`);
            }
          }

          analytics.lecturerStats = Object.values(lecturerStats);
        } else if (user.role === 'pl') {
          const usersRes = await axios.get('http://localhost:5000/api/users', { headers });
          const coursesRes = await axios.get('http://localhost:5000/api/courses', { headers });
          const reportsRes = await axios.get('http://localhost:5000/api/reports', { headers });
          analytics.users = usersRes.data;
          analytics.courses = coursesRes.data;
          analytics.reports = reportsRes.data;
          analytics.totalUsers = usersRes.data.length;
          analytics.totalCourses = coursesRes.data.length;
          analytics.totalReports = reportsRes.data.length;
          analytics.lecturers = usersRes.data.filter(u => u.role === 'lecturer');
          analytics.students = usersRes.data.filter(u => u.role === 'student');
          analytics.prls = usersRes.data.filter(u => u.role === 'prl');

          // Calculate ratings and activity
          analytics.ratings = [];
          for (const report of reportsRes.data) {
            try {
              const ratingsRes = await axios.get(`http://localhost:5000/api/users/ratings/${report.id}`, { headers });
              analytics.ratings.push(...ratingsRes.data);
            } catch (err) {
              console.log(`No ratings for report ${report.id}`);
            }
          }

          // Lecturer activity and ratings
          const lecturerActivity = {};
          reportsRes.data.forEach(report => {
            if (!lecturerActivity[report.lecturer_id]) {
              lecturerActivity[report.lecturer_id] = {
                name: report.lecturer_name,
                reports: 0,
                ratings: [],
                avgRating: 0
              };
            }
            lecturerActivity[report.lecturer_id].reports++;
          });

          analytics.ratings.forEach(rating => {
            const lecturer = analytics.lecturers.find(l => l.id === rating.rated_by);
            if (lecturer) {
              lecturerActivity[lecturer.id].ratings.push(rating.rating);
            }
          });

          // Calculate average ratings
          Object.values(lecturerActivity).forEach(lecturer => {
            if (lecturer.ratings.length > 0) {
              lecturer.avgRating = lecturer.ratings.reduce((sum, r) => sum + r, 0) / lecturer.ratings.length;
            }
          });

          analytics.lecturerActivity = Object.values(lecturerActivity);
        }

        setData(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role, token]);

  const toggleExpanded = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`]
    }));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (user.role === 'student') {
      const chartData = [
        { name: 'Enrolled', value: data.enrolledCourses || 0, color: '#3b82f6' },
        { name: 'Completed', value: data.completedCourses || 0, color: '#10b981' },
      ];

      return (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Course Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Enrolled Courses</h3>
            <div className="space-y-4">
              {data.courses?.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{course.course_name}</h4>
                      <p className="text-neutral-600">{course.course_code} - {course.department}</p>
                      <p className="text-sm text-neutral-500">Lecturer: {course.lecturer_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Submitted Reports & Feedback</h3>
            <div className="space-y-4">
              {data.reports?.map(report => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{report.course_name}</h4>
                      <p className="text-sm text-neutral-600">Week {report.week_of_reporting} - {report.date_of_lecture}</p>
                      <p className="text-sm text-neutral-500">Lecturer: {report.lecturer_name}</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('report', report.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`report-${report.id}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`report-${report.id}`] && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-neutral-900">Topic Taught</h5>
                        <p className="text-sm text-neutral-700">{report.topic_taught}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Learning Outcomes</h5>
                        <p className="text-sm text-neutral-700">{report.learning_outcomes}</p>
                      </div>
                      {report.prl_feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-neutral-900">PRL Feedback</h5>
                          <p className="text-sm text-neutral-700">{report.prl_feedback}</p>
                        </div>
                      )}
                      {data.ratings?.filter(r => r.report_id === report.id).map(rating => (
                        <div key={rating.id} className="bg-yellow-50 p-3 rounded-lg">
                          <h5 className="font-medium text-neutral-900">Rating by {rating.rated_by_name}</h5>
                          <p className="text-sm text-neutral-700">Rating: {rating.rating}/5</p>
                          {rating.comments && <p className="text-sm text-neutral-600 mt-1">{rating.comments}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (user.role === 'lecturer') {
      const chartData = [
        { name: 'Submitted', value: data.submittedReports || 0, color: '#3b82f6' },
        { name: 'Pending', value: data.pendingReports || 0, color: '#f59e0b' },
      ];

      return (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Report Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Attendance Overview</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{Math.round(data.attendance || 0)}</div>
                <p className="text-neutral-600">Average Students Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Assigned Classes</h3>
            <div className="space-y-4">
              {data.courses?.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg">{course.course_name}</h4>
                  <p className="text-neutral-600">{course.course_code} - {course.department}</p>
                  <p className="text-sm text-neutral-500">Total Students: {course.total_students}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Submitted Reports</h3>
            <div className="space-y-4">
              {data.reports?.map(report => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{report.course_name}</h4>
                      <p className="text-sm text-neutral-600">Week {report.week_of_reporting} - {report.date_of_lecture}</p>
                      <p className="text-sm text-neutral-500">Students Present: {report.actual_students_present}</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('report', report.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`report-${report.id}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`report-${report.id}`] && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-neutral-900">Topic Taught</h5>
                        <p className="text-sm text-neutral-700">{report.topic_taught}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Learning Outcomes</h5>
                        <p className="text-sm text-neutral-700">{report.learning_outcomes}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Recommendations</h5>
                        <p className="text-sm text-neutral-700">{report.recommendations || 'None'}</p>
                      </div>
                      {report.prl_feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-neutral-900">PRL Feedback</h5>
                          <p className="text-sm text-neutral-700">{report.prl_feedback}</p>
                        </div>
                      )}
                      {data.ratings?.filter(r => r.report_id === report.id).map(rating => (
                        <div key={rating.id} className="bg-yellow-50 p-3 rounded-lg">
                          <h5 className="font-medium text-neutral-900">Rating by {rating.rated_by_name}</h5>
                          <p className="text-sm text-neutral-700">Rating: {rating.rating}/5</p>
                          {rating.comments && <p className="text-sm text-neutral-600 mt-1">{rating.comments}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (user.role === 'prl') {
      const chartData = [
        { name: 'Reviewed', value: data.reviewedReports || 0, color: '#10b981' },
        { name: 'Pending', value: data.pendingReviews || 0, color: '#f59e0b' },
      ];

      return (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Review Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Lecturer Statistics</h3>
            <div className="space-y-4">
              {data.lecturerStats?.map(stat => (
                <div key={stat.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{stat.name}</h4>
                      <p className="text-neutral-600">Total Reports: {stat.reports}</p>
                      <p className="text-sm text-neutral-500">Average Rating: {stat.ratings.length > 0 ? (stat.ratings.reduce((sum, r) => sum + r.rating, 0) / stat.ratings.length).toFixed(1) : 'N/A'}/5</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('lecturer', stat.name)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`lecturer-${stat.name}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`lecturer-${stat.name}`] && (
                    <div className="mt-4 space-y-3">
                      <h5 className="font-medium text-neutral-900">Individual Ratings</h5>
                      {stat.ratings.map((rating, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-neutral-700">Rating: {rating.rating}/5</p>
                          {rating.comments && <p className="text-sm text-neutral-600 mt-1">{rating.comments}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Reports from Lecturers</h3>
            <div className="space-y-4">
              {data.reports?.map(report => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{report.course_name}</h4>
                      <p className="text-sm text-neutral-600">Lecturer: {report.lecturer_name} - Week {report.week_of_reporting}</p>
                      <p className="text-sm text-neutral-500">{report.date_of_lecture}</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('report', report.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`report-${report.id}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`report-${report.id}`] && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-neutral-900">Topic Taught</h5>
                        <p className="text-sm text-neutral-700">{report.topic_taught}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Learning Outcomes</h5>
                        <p className="text-sm text-neutral-700">{report.learning_outcomes}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Students Present</h5>
                        <p className="text-sm text-neutral-700">{report.actual_students_present}</p>
                      </div>
                      {report.prl_feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-neutral-900">Your Feedback</h5>
                          <p className="text-sm text-neutral-700">{report.prl_feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (user.role === 'pl') {
      const userChartData = [
        { name: 'Lecturers', value: data.lecturers?.length || 0, color: '#3b82f6' },
        { name: 'Students', value: data.students?.length || 0, color: '#10b981' },
        { name: 'PRLs', value: data.prls?.length || 0, color: '#f59e0b' },
      ];

      const activityChartData = [
        { name: 'Users', value: data.totalUsers || 0 },
        { name: 'Courses', value: data.totalCourses || 0 },
        { name: 'Reports', value: data.totalReports || 0 },
      ];

      return (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">System Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">All Courses</h3>
            <div className="space-y-4">
              {data.courses?.map(course => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{course.course_name}</h4>
                      <p className="text-neutral-600">{course.course_code} - {course.department}</p>
                      <p className="text-sm text-neutral-500">Lecturer: {course.lecturer_name}</p>
                      <p className="text-sm text-neutral-500">Total Students: {course.total_students}</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('course', course.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`course-${course.id}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`course-${course.id}`] && (
                    <div className="mt-4">
                      <h5 className="font-medium text-neutral-900 mb-3">Reports for this Course</h5>
                      <div className="space-y-3">
                        {data.reports?.filter(r => r.course_id === course.id).map(report => (
                          <div key={report.id} className="bg-neutral-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-sm">Week {report.week_of_reporting} - {report.date_of_lecture}</p>
                                <p className="text-xs text-neutral-600">Students Present: {report.actual_students_present}</p>
                              </div>
                              <button
                                onClick={() => toggleExpanded('report', report.id)}
                                className="text-primary hover:text-primary-dark text-xs font-medium"
                              >
                                {expandedItems[`report-${report.id}`] ? 'Less' : 'More'}
                              </button>
                            </div>

                            {expandedItems[`report-${report.id}`] && (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-neutral-900">Topic:</p>
                                  <p className="text-xs text-neutral-700">{report.topic_taught}</p>
                                </div>
                                {report.prl_feedback && (
                                  <div className="bg-blue-50 p-2 rounded">
                                    <p className="text-xs font-medium text-neutral-900">PRL Feedback:</p>
                                    <p className="text-xs text-neutral-700">{report.prl_feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Lecturer Activity & Ratings</h3>
            <div className="space-y-4">
              {data.lecturerActivity?.map(activity => (
                <div key={activity.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{activity.name}</h4>
                      <p className="text-neutral-600">Reports Submitted: {activity.reports}</p>
                      <p className="text-sm text-neutral-500">Average Rating: {activity.avgRating.toFixed(1)}/5</p>
                    </div>
                    <button
                      onClick={() => toggleExpanded('lecturer', activity.name)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedItems[`lecturer-${activity.name}`] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expandedItems[`lecturer-${activity.name}`] && (
                    <div className="mt-4">
                      <h5 className="font-medium text-neutral-900 mb-3">Detailed Reports</h5>
                      <div className="space-y-3">
                        {data.reports?.filter(r => r.lecturer_id === data.lecturers.find(l => l.name === activity.name)?.id).map(report => (
                          <div key={report.id} className="bg-neutral-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-sm">{report.course_name}</p>
                                <p className="text-xs text-neutral-600">Week {report.week_of_reporting} - {report.date_of_lecture}</p>
                                <p className="text-xs text-neutral-600">Students: {report.actual_students_present}</p>
                              </div>
                              <button
                                onClick={() => toggleExpanded('report', report.id)}
                                className="text-primary hover:text-primary-dark text-xs font-medium"
                              >
                                {expandedItems[`report-${report.id}`] ? 'Less' : 'More'}
                              </button>
                            </div>

                            {expandedItems[`report-${report.id}`] && (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-neutral-900">Topic:</p>
                                  <p className="text-xs text-neutral-700">{report.topic_taught}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-neutral-900">Outcomes:</p>
                                  <p className="text-xs text-neutral-700">{report.learning_outcomes}</p>
                                </div>
                                {report.prl_feedback && (
                                  <div className="bg-blue-50 p-2 rounded">
                                    <p className="text-xs font-medium text-neutral-900">PRL Feedback:</p>
                                    <p className="text-xs text-neutral-700">{report.prl_feedback}</p>
                                  </div>
                                )}
                                {data.ratings?.filter(r => r.report_id === report.id).map(rating => (
                                  <div key={rating.id} className="bg-yellow-50 p-2 rounded">
                                    <p className="text-xs font-medium text-neutral-900">Rating by {rating.rated_by_name}:</p>
                                    <p className="text-xs text-neutral-700">{rating.rating}/5</p>
                                    {rating.comments && <p className="text-xs text-neutral-600 mt-1">{rating.comments}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Monitoring Dashboard</h1>
            <p className="text-neutral-600 mt-1">Analytics and insights for {user.role}</p>
          </div>
          <Link
            to="/"
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Monitoring;
