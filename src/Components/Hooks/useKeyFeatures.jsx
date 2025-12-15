import { useState, useEffect } from 'react';
import axios from 'axios';

const useKeyFeatures = () => {
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKeyFeatures = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://razobytehealthcare-website-backend-code.onrender.com/v1/api/key_feature_get");
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