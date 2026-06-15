import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const useKeyFeatures = () => {
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKeyFeatures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/key_feature_get`);
      setKeyFeatures(res.data);
    } catch (error) {
      console.error("Error fetching key features:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyFeatures();
  }, []);

  return {
    keyFeatures,
    loading,
    refreshKeyFeatures: fetchKeyFeatures
  };
};

export default useKeyFeatures;
