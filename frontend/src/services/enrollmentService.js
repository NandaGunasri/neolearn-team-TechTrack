import API from './api';

export const enrollCourse = (courseId) => API.post('/enroll', { courseId });
export const getStudentEnrollments = (studentId) => API.get(`/enrollments/${studentId}`);
export const getMyCourses = () => API.get('/my-courses');
export const getCourseStudents = (courseId) => API.get(`/courses/${courseId}/students`);
