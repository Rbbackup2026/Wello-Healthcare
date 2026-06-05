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
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import LabFormDialog from '../DailogForm/LabFormDialog';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000"/v1/api';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch labs from API
  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching labs from:', `${BASE_URL}/getlab`);
      const response = await axios.get(`${BASE_URL}/getlab`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setLabs(response.data.data);
        console.log('Labs data set:', response.data.data);
      } else {
        setError('Failed to fetch labs: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
      setError('Failed to fetch labs: ' + error.message);
      // Temporary mock data for testing
      setLabs([
        {
          _id: '1',
          labName: 'Test Lab 1',
          labId: 'LAB001',
          labelCode: 'LC001',
          city: 'Mumbai',
          labType: 'Main Lab',
          phoneNumber: '9876543210',
          address: 'Test Address 1',
          sortOrder: 1,
          status: 'active',
          imageUrl: ''
        },
        {
          _id: '2',
          labName: 'Test Lab 2',
          labId: 'LAB002',
          labelCode: 'LC002',
          city: 'Delhi',
          labType: 'Branch Lab',
          phoneNumber: '9876543211',
          address: 'Test Address 2',
          sortOrder: 2,
          status: 'inactive',
          imageUrl: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleStatusToggle = async (lab) => {
    setActionLoading(`status-${lab._id}`);
    try {
      const response = await axios.patch(`${BASE_URL}/labs/${lab._id}/toggle-status`);
      if (response.data.success) {
        setLabs(prev => prev.map(item => 
          item._id === lab._id 
            ? { ...item, status: response.data.data.status }
            : item
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update lab status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (lab) => {
    setActionLoading(`delete-${lab._id}`);
    try {
      const response = await axios.delete(`${BASE_URL}/labs/delete_lab/${lab._id}`);
      if (response.data.success) {
        setLabs(prev => prev.filter(item => item._id !== lab._id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting lab:', error);
      alert('Failed to delete lab');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingLab(null);
    setIsDialogOpen(true);
  };

  const handleSaveLab = async (savedLab) => {
    try {
      if (editingLab) {
        setLabs(prev => prev.map(lab => 
          lab._id === editingLab._id 
            ? savedLab
            : lab
        ));
      } else {
        setLabs(prev => [savedLab, ...prev]);
      }
      
      setIsDialogOpen(false);
      setEditingLab(null);
    } catch (error) {
      console.error('Error handling saved lab:', error);
      throw error;
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLab(null);
  };

  // Filter labs based on search
  const filteredLabs = labs.filter(lab =>
    lab.labName?.toLowerCase().includes(search.toLowerCase()) ||
    lab.city?.toLowerCase().includes(search.toLowerCase()) ||
    lab.labId?.toLowerCase().includes(search.toLowerCase()) ||
    lab.labelCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLabs = filteredLabs.slice(startIndex, startIndex + itemsPerPage);

  console.log('Current labs state:', labs);
  console.log('Filtered labs:', filteredLabs);
  console.log('Paginated labs:', paginatedLabs);

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
            <h1 className="text-2xl font-semibold text-gray-800">MANAGE ITEMS / LAB</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Lab</h2>
        </div>

        {/* Debug Info */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800">
                ALL LAB {labs.length > 0 && `(${labs.length})`}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Lab
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search labs by name, city, lab ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Lab Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Sort order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
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
                      <p className="mt-2 text-gray-500">Loading labs...</p>
                    </td>
                  </tr>
                ) : paginatedLabs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {search ? 'No labs found matching your search.' : 'No labs available. Click "Add New Lab" to create one.'}
                    </td>
                  </tr>
                ) : (
                  paginatedLabs.map((lab) => (
                    <tr key={lab._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                        {lab._id?.slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                          {lab.imageUrl ? (
                            <img 
                              src={`${BASE_URL}${lab.imageUrl}`} 
                              alt={lab.labName}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {lab.labName || 'Unnamed Lab'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Lab ID:</span> {lab.labId || 'N/A'} | <span className="font-medium">Label:</span> {lab.labelCode || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">City:</span> {lab.city || 'N/A'} | <span className="font-medium">Type:</span> {lab.labType || 'N/A'}
                        </div>
                        {lab.phoneNumber && (
                          <div className="text-xs text-gray-400 mt-1">
                            📞 {lab.phoneNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {lab.sortOrder || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                        <button
                          onClick={() => handleStatusToggle(lab)}
                          disabled={actionLoading === `status-${lab._id}`}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                            lab.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                          }`}
                        >
                          {actionLoading === `status-${lab._id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : lab.status === 'active' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {lab.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(lab)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900 p-2 rounded transition-colors hover:bg-blue-50"
                            title="Edit Lab"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(lab)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 p-2 rounded transition-colors hover:bg-red-50"
                            title="Delete Lab"
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
          {filteredLabs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLabs.length)} of{' '}
                  {filteredLabs.length} entries
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lab Form Dialog */}
      <LabFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        lab={editingLab}
        onSave={handleSaveLab}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lab</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{deleteConfirm.labName}"</strong>? This action cannot be undone.
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

export default Labs;