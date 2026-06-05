import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/v1/api';

const useLabs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all labs
  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/getlab`);
      if (response.data.success) {
        setLabs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching labs:', err);
      setError('Failed to fetch labs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new lab
  const createLab = async (labData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', labData.name);
      formData.append('address', labData.address);
      formData.append('city', labData.city);
      formData.append('contactNumber', labData.contactNumber);
      formData.append('email', labData.email);
      formData.append('status', labData.status);
      
      if (labData.imageFile) {
        formData.append('image', labData.imageFile);
      }

      const response = await axios.post(
        `${BASE_URL}/post_lab`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setLabs(prev => [response.data.data, ...prev]);
        return response.data.data;
      }
    } catch (err) {
      console.error('Error creating lab:', err);
      setError('Failed to create lab');
      throw err;
    }
  };

  // Update lab
  const updateLab = async (labId, labData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', labData.name);
      formData.append('address', labData.address);
      formData.append('city', labData.city);
      formData.append('contactNumber', labData.contactNumber);
      formData.append('email', labData.email);
      formData.append('status', labData.status);
      
      if (labData.imageFile) {
        formData.append('image', labData.imageFile);
      }

      const response = await axios.put(
        `${BASE_URL}/labs/${labId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setLabs(prev => prev.map(lab => 
          lab._id === labId 
            ? response.data.data
            : lab
        ));
        return response.data.data;
      }
    } catch (err) {
      console.error('Error updating lab:', err);
      setError('Failed to update lab');
      throw err;
    }
  };

  // Delete lab
  const deleteLab = async (labId) => {
    setError(null);
    try {
      const response = await axios.delete(`${BASE_URL}/labs/${labId}`);
      if (response.data.success) {
        setLabs(prev => prev.filter(lab => lab._id !== labId));
      }
    } catch (err) {
      console.error('Error deleting lab:', err);
      setError('Failed to delete lab');
      throw err;
    }
  };

  // Toggle lab status
  const toggleLabStatus = async (labId) => {
    setError(null);
    try {
      const response = await axios.patch(`${BASE_URL}/labs/${labId}/toggle-status`);
      if (response.data.success) {
        setLabs(prev => prev.map(lab => 
          lab._id === labId 
            ? { ...lab, status: response.data.data.status }
            : lab
        ));
        return response.data.data;
      }
    } catch (err) {
      console.error('Error toggling lab status:', err);
      setError('Failed to update lab status');
      throw err;
    }
  };

  // Get active labs only
  const getActiveLabs = () => {
    return labs.filter(lab => lab.status === 'active' || lab.status === true);
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  return {
    labs,
    loading,
    error,
    fetchLabs,
    createLab,
    updateLab,
    deleteLab,
    toggleLabStatus,
    getActiveLabs
  };
};

export default useLabs;