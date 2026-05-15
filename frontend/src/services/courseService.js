// frontend/src/services/courseService.js
import API from './api';

// --- Courses ---
export const getAllCourses = () => API.get('/courses');
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const getEnrolledCourses = () => API.get('/courses/enrolled');
export const createCourse = (data) => API.post('/courses', data);
export const getCourseStudents = (courseId) => API.get(`/courses/${courseId}/students`);

// --- Assignments & Grades ---
export const createAssignment = (data) => API.post('/assignments/create', data);
export const getAssignmentsByCourse = (courseId) => API.get(`/assignments/${courseId}`);
export const submitAssignment = (id, content) => API.post(`/assignments/${id}/submit`, { content });
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);
export const postGrade = (data) => API.post('/grades', data);
export const getMyGrades = () => API.get('/grades/my-performance');
export const getStudentGrades = (studentId) => API.get(`/grades/student/${studentId}`);

// --- Discussions ---
export const getDiscussions = (courseId) => API.get(`/discussions/${courseId}`);
export const postComment = (courseId, content) => API.post('/discussions', { courseId, content });

// --- Achievements ---
export const getAchievements = () => API.get('/auth/achievements');

// --- Materials ---
export const getMaterials = (courseId) => API.get(`/materials/${courseId}`);
export const uploadMaterial = (data) => API.post('/materials', data);
export const deleteMaterial = (id) => API.delete(`/materials/${id}`);

// --- Notifications ---
export const getNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.post('/notifications/read-all');

// --- Submissions ---
export const getSubmissionsByAssignment = (assignmentId) => API.get(`/assignments/submissions/${assignmentId}`);
export const reviewSubmission = (id, data) => API.post(`/assignments/submissions/${id}/review`, data);
