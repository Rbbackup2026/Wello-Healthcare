import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const useBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/categorybloget`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/categoryblog/post`, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCategories(prev => [...prev, response.data.data]);
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('❌ Error creating category:', error);
      setError(error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/categoryblogput/${id}`, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCategories(prev => 
          prev.map(cat => cat._id === id ? response.data.data : cat)
        );
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('❌ Error updating category:', error);
      setError(error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/categoryblogid/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCategories(prev => prev.filter(cat => cat._id !== id));
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      setError(error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete categories
  const bulkDeleteCategories = async (ids) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/catogryblog/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { ids }
      });

      if (response.data.success) {
        setCategories(prev => prev.filter(cat => !ids.includes(cat._id)));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete categories');
      }
    } catch (error) {
      console.error('❌ Error bulk deleting categories:', error);
      setError(error.response?.data?.message || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  

  // Search categories
  const searchCategories = (searchTerm) => {
    if (!searchTerm) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get category by ID
  const getCategoryById = (id) => {
    return categories.find(category => category._id === id);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    // State
    categories,
    loading,
    error,
    
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    searchCategories,
    getCategoryById,
    clearError,
    
    // Utility
    hasCategories: categories.length > 0,
    categoriesCount: categories.length
  };
};
  
export default useBlogCategories;
