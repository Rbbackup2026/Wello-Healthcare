import { useState, useEffect } from 'react';
import axios from 'axios';

const useSortOrders = () => {
  const [sortOrders, setSortOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSortOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/v1/api/categories');
      if (response.data && Array.isArray(response.data)) {
        const orders = response.data
          .map(category => category.sortOrder)
          .filter(order => order != null)
          .sort((a, b) => a - b);
        setSortOrders(orders);
      }
    } catch (err) {
      console.error('Error fetching sort orders:', err);
      setError(err.message);
      setSortOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSortOrders();
  }, []);

  const generateNewSortOrder = () => {
    if (sortOrders.length === 0) return 1;
    return Math.max(...sortOrders) + 1;
  };

  return {
    sortOrders,
    loading,
    error,
    refreshSortOrders: fetchSortOrders,
    generateNewSortOrder
  };
};

export default useSortOrders;