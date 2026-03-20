import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hms_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');
export const registerUserApi = (data) => api.post('/auth/register', data);

// Patients
export const getPatientsApi = (params) => api.get('/patients', { params });
export const getPatientApi = (id) => api.get(`/patients/${id}`);
export const createPatientApi = (data) => api.post('/patients', data);
export const updatePatientApi = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatientApi = (id) => api.delete(`/patients/${id}`);

// Appointments
export const getAppointmentsApi = (params) => api.get('/appointments', { params });
export const createAppointmentApi = (data) => api.post('/appointments', data);
export const updateAppointmentStatusApi = (id, data) => api.put(`/appointments/${id}/status`, data);
export const deleteAppointmentApi = (id) => api.delete(`/appointments/${id}`);

// Bills
export const getBillsApi = (params) => api.get('/bills', { params });
export const createBillApi = (data) => api.post('/bills', data);
export const updateBillStatusApi = (id, data) => api.put(`/bills/${id}/status`, data);

// Users/Staff
export const getUsersApi = (params) => api.get('/users', { params });
export const registerStaffApi = (data) => api.post('/auth/register', data);
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data);

// Departments
export const getDepartmentsApi = () => api.get('/departments');
export const createDepartmentApi = (data) => api.post('/departments', data);

// Rooms
export const getRoomsApi = (params) => api.get('/rooms', { params });
export const createRoomApi = (data) => api.post('/rooms', data);
export const updateRoomApi = (id, data) => api.put(`/rooms/${id}`, data);

// Medicines
export const getMedicinesApi = (params) => api.get('/medicines', { params });
export const createMedicineApi = (data) => api.post('/medicines', data);
export const updateMedicineApi = (id, data) => api.put(`/medicines/${id}`, data);

// Lab Tests
export const getLabTestsApi = (params) => api.get('/labtests', { params });
export const createLabTestApi = (data) => api.post('/labtests', data);
export const updateLabTestStatusApi = (id, data) => api.put(`/labtests/${id}`, data);

// Dashboard
export const getDashboardStatsApi = () => api.get('/dashboard/stats');
