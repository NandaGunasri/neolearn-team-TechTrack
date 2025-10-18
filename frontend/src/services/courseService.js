// frontend/src/services/courseService.js
import API from './api';

// Get all courses created by the logged-in teacher
export const getMyCourses = async () => {
  return await API.get('/api/courses/my-courses');
};

// Create a new course (if you need this later)
export const createCourse = async (data) => {
  return await API.post('/api/courses', data);
};

// Get course details by ID
export const getCourseById = async (id) => {
  return await API.get(`/api/courses/${id}`);
};
