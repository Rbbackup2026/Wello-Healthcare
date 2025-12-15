// Hooks/useDiseases.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "https://razobytehealthcare-website-backend-code.onrender.com/v1/api";

const useDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/diseasepost/active/list`);
      
      // Ensure we always get an array
      if (response.data && response.data.diseases) {
        setDiseases(response.data.diseases);
      } else if (response.data && Array.isArray(response.data)) {
        setDiseases(response.data);
      } else {
        setDiseases([]);
      }
    } catch (err) {
      console.error("Error fetching diseases:", err);
      setError(err.message);
      // Return empty array instead of throwing error
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  return { diseases, loading, error, refetch: fetchDiseases };
};

export default useDiseases;