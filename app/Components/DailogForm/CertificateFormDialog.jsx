import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';

const CertificateFormDialog = ({ open, onClose, certificate, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    imageFile: null,
    sortOrder: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (certificate) {
      // Edit mode - existing certificate data fill करें
      setFormData({
        name: certificate.name || '',
        imageFile: null,
        sortOrder: certificate.sortOrder?.toString() || '',
        status: certificate.status || 'active'
      });
    } else {
      // Add new mode - form reset करें
      setFormData({
        name: '',
        imageFile: null,
        sortOrder: '',
        status: 'active'
      });
    }
    setErrors({});
    setApiError('');
  }, [certificate, open]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        imageFile: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Certificate name is required';
    }

    if (!formData.sortOrder) {
      newErrors.sortOrder = 'Sort order is required';
    } else if (isNaN(formData.sortOrder) || parseInt(formData.sortOrder) < 1) {
      newErrors.sortOrder = 'Sort order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('sortOrder', parseInt(formData.sortOrder));
      submitData.append('status', formData.status);
      
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }

      // POST API Call
      const response = await axios.post(
        'http://localhost:3000/v1/api/certificate_upload',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data.success) {
        // Success case
        onSave(response.data.data);
        
        // Reset form
        setFormData({
          name: '',
          imageFile: null,
          sortOrder: '',
          status: 'active'
        });
        
        onClose();
      } else {
        // API returned error
        setApiError(response.data.message || 'Failed to create certificate');
      }

    } catch (error) {
      console.error('Certificate upload error:', error);
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        
        if (serverError.errors && Array.isArray(serverError.errors)) {
          // Validation errors from server
          setApiError(serverError.errors.join(', '));
        } else if (serverError.message) {
          setApiError(serverError.message);
        } else {
          setApiError('Server error occurred');
        }
      } else if (error.request) {
        // Network error
        setApiError('Network error: Could not connect to server');
      } else {
        // Other errors
        setApiError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const removeSelectedFile = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null
    }));
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {certificate ? 'Edit Certificate' : 'Add New Certificate'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error Message */}
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter certificate name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Image File and Sort Order Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image File
              </label>
              <div className="flex flex-col space-y-2">
                {!formData.imageFile ? (
                  <label className="flex flex-col items-center px-4 py-3 bg-white text-blue-500 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Choose File</span>
                    <input
                      type="file"
                      name="imageFile"
                      onChange={handleInputChange}
                      disabled={loading}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 truncate">
                        {formData.imageFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      disabled={loading}
                      className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order *
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                  errors.sortOrder ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter sort order"
                min="1"
              />
              {errors.sortOrder && (
                <p className="mt-1 text-sm text-red-600">{errors.sortOrder}</p>
              )}
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {certificate ? 'Update' : 'Create'} Certificate
              {loading ? '...' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateFormDialog;