import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

// Penyedia State Global Kursus (Daftar Kelas, Tambah/Edit/Hapus Kursus & Materi)
export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fungsi Ambil Daftar Kursus: Tembak GET /courses dengan parameter pencarian/filter
  const fetchCourses = async (filters = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const queryString = params.toString();
      const response = await api.get(`/courses${queryString ? `?${queryString}` : ''}`);
      if (response.status === 'success' && response.data) {
        const storedThumbnails = JSON.parse(localStorage.getItem('mbg_thumbnails') || '{}');
        const courseList = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setCourses(courseList.map(c => {
          if (storedThumbnails[c.id]) c.thumbnail_url = storedThumbnails[c.id];
          return c;
        }));
      }
    } catch (err) {
      console.error('Gagal mengambil data kursus:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Tambah Kursus Baru oleh Pengajar (POST /courses)
  const addCourse = async (courseData, customThumbnail = null) => {
    try {
      const res = await api.post('/courses', courseData);
      if (res.status === 'success' && res.data) {
        if (customThumbnail) {
          const stored = JSON.parse(localStorage.getItem('mbg_thumbnails') || '{}');
          stored[res.data.id] = customThumbnail;
          localStorage.setItem('mbg_thumbnails', JSON.stringify(stored));
          res.data.thumbnail_url = customThumbnail;
        }
        // Langsung tambahkan kursus baru ke state memori agar UI ter-update instan tanpa reload
        setCourses(prev => [...prev, res.data]);
      }
      return res;
    } catch (error) {
      console.error('Gagal menambah kursus:', error.response?.data || error.message);
      throw error;
    }
  };

  const addMaterial = async (courseId, materialData) => {
    try {
      const response = await api.post(`/courses/${courseId}/materials`, materialData);
      return response;
    } catch (err) {
      console.error('Failed to add material:', err);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      if (response.status === 'success') {
        setCourses(prev => prev.filter(course => course.id !== courseId));
      }
      return response;
    } catch (err) {
      console.error('Failed to delete course:', err);
      throw err;
    }
  };

  const updateCourse = async (courseId, courseData, customThumbnail = null) => {
    try {
      const res = await api.put(`/courses/${courseId}`, courseData);
      if (res.status === 'success' && res.data) {
        if (customThumbnail) {
          const stored = JSON.parse(localStorage.getItem('mbg_thumbnails') || '{}');
          stored[courseId] = customThumbnail;
          localStorage.setItem('mbg_thumbnails', JSON.stringify(stored));
        }
        setCourses(prev => prev.map(c => {
          if (c.id === courseId) {
            const updated = { ...c, ...res.data };
            if (customThumbnail) updated.thumbnail_url = customThumbnail;
            return updated;
          }
          return c;
        }));
      }
      return res;
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateMaterial = async (materialId, materialData) => {
    try {
      const response = await api.put(`/materials/${materialId}`, materialData);
      return response;
    } catch (err) {
      console.error('Failed to update material:', err);
      throw err;
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      const response = await api.delete(`/materials/${materialId}`);
      return response;
    } catch (err) {
      console.error('Failed to delete material:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [user]);

  return (
    <CourseContext.Provider value={{ courses, loading, fetchCourses, addCourse, updateCourse, deleteCourse, addMaterial, updateMaterial, deleteMaterial }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
