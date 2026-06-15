// Hooks/useDepartments.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const BASE_URL = API_BASE_URL;

const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/get-departments`);
      console.log("Departments API Response:", response.data);
      
      // Ensure we always get an array
      if (response.data && response.data.departments) {
        setDepartments(response.data.departments);
      } else if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departments, loading, error, refetch: fetchDepartments };
};

export default useDepartments;
