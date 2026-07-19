import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
        // Handle paginated structure (since backend /courses returns { data: [...], meta: {...} })
        const courseList = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setCourses(courseList);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

    const addCourse = async (courseData) => {
        try {
            const res = await api.post('/courses', courseData);
            // res is the full JSON: { status, data: { id, title, ... } }
            if (res.status === 'success' && res.data) {
                setCourses(prev => [...prev, res.data]);
            }
            return res; // Return full response so callers can access res.data.id
        } catch (error) {
            console.error('Error adding course:', error.response?.data || error.message);
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

  const updateCourse = async (courseId, courseData) => {
    try {
      const res = await api.put(`/courses/${courseId}`, courseData);
      if (res.status === 'success' && res.data) {
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...res.data } : c));
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
