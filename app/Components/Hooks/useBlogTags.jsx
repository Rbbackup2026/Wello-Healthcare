import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const useBlogTags = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tagget`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    refreshCategories: fetchCategories
  };
};

export default useBlogTags;
