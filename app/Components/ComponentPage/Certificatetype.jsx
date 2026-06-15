"use client";
import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import CertificateFormDialog from "../DailogForm/CertificateFormDialog";
import axios from 'axios';
import { API_BASE_URL, API_ORIGIN } from '../../utils/api';

const BASE_URL = API_BASE_URL;

const Certificatetype = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch all certificates
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/certificate_upload`);
      if (response.data.success) {
        setCertificates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      alert('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Toggle certificate status
  const handleStatusToggle = async (certificate) => {
    setActionLoading(`status-${certificate._id}`);
    try {
      const response = await axios.patch(`${BASE_URL}/${certificate._id}/toggle-status`);
      if (response.data.success) {
        // Update local state
        setCertificates(prev => prev.map(cert => 
          cert._id === certificate._id 
            ? { ...cert, status: response.data.data.status }
            : cert
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update certificate status');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete certificate
  const handleDelete = async (certificate) => {
    setActionLoading(`delete-${certificate._id}`);
    try {
      const response = await axios.delete(`${BASE_URL}/${certificate._id}`);
      if (response.data.success) {
        // Remove from local state
        setCertificates(prev => prev.filter(cert => cert._id !== certificate._id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Failed to delete certificate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCertificate(null);
    setIsDialogOpen(true);
  };

  // Save certificate (Create or Update)
  const handleSaveCertificate = async (certificateData) => {
    try {
      if (editingCertificate) {
        // Update existing certificate
        const formData = new FormData();
        formData.append('name', certificateData.name);
        formData.append('sortOrder', certificateData.sortOrder);
        formData.append('status', certificateData.status);
        
        if (certificateData.imageFile) {
          formData.append('image', certificateData.imageFile);
        }

        const response = await axios.put(
          `${BASE_URL}/put/${editingCertificate._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setCertificates(prev => prev.map(cert => 
            cert._id === editingCertificate._id 
              ? response.data.data
              : cert
          ));
        }
      } else {
        // Create new certificate
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
          // Add to local state
          setCertificates(prev => [response.data.data, ...prev]);
        }
      }
      
      setIsDialogOpen(false);
      setEditingCertificate(null);
    } catch (error) {
      console.error('Error saving certificate:', error);
      throw error; // Let the dialog handle the error
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCertificate(null);
  };

  // Filter certificates based on search
  const filteredCertificates = certificates.filter(cert =>
    cert.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">MANAGE ITEMS / CERTIFICATE</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Certificate</h2>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800">ALL CERTIFICATE</h3>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Certificate
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                      <p className="mt-2 text-gray-500">Loading certificates...</p>
                    </td>
                  </tr>
                ) : paginatedCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {search ? 'No certificates found matching your search.' : 'No certificates available.'}
                    </td>
                  </tr>
                ) : (
                  paginatedCertificates.map((certificate) => (
                    <tr key={certificate._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificate._id?.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                          {certificate.imageUrl ? (
                            <img 
                              src={`${API_ORIGIN}${certificate.imageUrl}`} 
                              alt={certificate.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {certificate.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(certificate.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {certificate.sortOrder}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(certificate)}
                          disabled={actionLoading === `status-${certificate._id}`}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                            certificate.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                          }`}
                        >
                          {actionLoading === `status-${certificate._id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : certificate.status === 'active' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {certificate.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(certificate)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900 p-2 rounded transition-colors hover:bg-blue-50"
                            title="Edit Certificate"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(certificate)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 p-2 rounded transition-colors hover:bg-red-50"
                            title="Delete Certificate"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCertificates.length)} of{' '}
                {filteredCertificates.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Form Dialog */}
      {isDialogOpen && (
        <CertificateFormDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          certificate={editingCertificate}
          onSave={handleSaveCertificate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Certificate</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === `delete-${deleteConfirm._id}`}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === `delete-${deleteConfirm._id}`}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading === `delete-${deleteConfirm._id}` && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificatetype;