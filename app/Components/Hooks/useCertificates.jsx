import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/v1/api';

const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all certificates
  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/certificate_upload`);
      if (response.data.success) {
        setCertificates(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new certificate
  const createCertificate = async (certificateData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', certificateData.name);
      formData.append('sortOrder', certificateData.sortOrder);
      formData.append('status', certificateData.status);
      
      if (certificateData.imageFile) {
        formData.append('image', certificateData.imageFile);
      }

      const response = await axios.post(
        `${BASE_URL}/certificate_upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setCertificates(prev => [response.data.data, ...prev]);
        return response.data.data;
      }
    } catch (err) {
      console.error('Error creating certificate:', err);
      setError('Failed to create certificate');
      throw err;
    }
  };

  // Update certificate
  const updateCertificate = async (certificateId, certificateData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', certificateData.name);
      formData.append('sortOrder', certificateData.sortOrder);
      formData.append('status', certificateData.status);
      
      if (certificateData.imageFile) {
        formData.append('image', certificateData.imageFile);
      }

      const response = await axios.put(
        `${BASE_URL}/put/${certificateId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setCertificates(prev => prev.map(cert => 
          cert._id === certificateId 
            ? response.data.data
            : cert
        ));
        return response.data.data;
      }
    } catch (err) {
      console.error('Error updating certificate:', err);
      setError('Failed to update certificate');
      throw err;
    }
  };

  // Delete certificate
  const deleteCertificate = async (certificateId) => {
    setError(null);
    try {
      const response = await axios.delete(`${BASE_URL}/${certificateId}`);
      if (response.data.success) {
        setCertificates(prev => prev.filter(cert => cert._id !== certificateId));
      }
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError('Failed to delete certificate');
      throw err;
    }
  };

  // Toggle certificate status
  const toggleCertificateStatus = async (certificateId) => {
    setError(null);
    try {
      const response = await axios.patch(`${BASE_URL}/${certificateId}/toggle-status`);
      if (response.data.success) {
        setCertificates(prev => prev.map(cert => 
          cert._id === certificateId 
            ? { ...cert, status: response.data.data.status }
            : cert
        ));
        return response.data.data;
      }
    } catch (err) {
      console.error('Error toggling certificate status:', err);
      setError('Failed to update certificate status');
      throw err;
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    toggleCertificateStatus
  };
};

export default useCertificates;