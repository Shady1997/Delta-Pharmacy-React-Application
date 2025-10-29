import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { FileText, Upload, X, Clock, CheckCircle, XCircle } from 'lucide-react';

const PrescriptionsScreen = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ isOpen: false, prescriptionId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [uploadData, setUploadData] = useState({
    fileName: '',
    fileType: 'PDF',
    doctorName: '',
    notes: ''
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (isAdmin) {
        data = await ApiService.get('/prescriptions');
      } else {
        data = await ApiService.get(`/prescriptions/user/${user.id}`);
      }
      
      console.log('Prescriptions data:', data);
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showError('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.id, showError]);

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
    }
  }, [fetchPrescriptions, user?.id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.fileName.trim() || !uploadData.doctorName.trim()) {
      showError('Please fill all required fields');
      return;
    }

    try {
      const params = new URLSearchParams({
        userId: user.id,
        fileName: uploadData.fileName,
        fileType: uploadData.fileType.toLowerCase(),
        doctorName: uploadData.doctorName,
        ...(uploadData.notes && { notes: uploadData.notes })
      });

      await ApiService.post(`/prescriptions/upload?${params.toString()}`);
      success('Prescription uploaded successfully!');
      setShowModal(false);
      setUploadData({ fileName: '', fileType: 'PDF', doctorName: '', notes: '' });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error uploading prescription:', error);
      showError('Failed to upload prescription');
    }
  };

  const handleApprovePrescription = async (prescriptionId) => {
    try {
      await ApiService.put(`/prescriptions/${prescriptionId}/approve`);
      success('Prescription approved successfully');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error approving prescription:', error);
      showError('Failed to approve prescription');
    }
  };

  const handleRejectPrescription = (prescriptionId) => {
    setRejectDialog({ isOpen: true, prescriptionId });
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      showError('Please provide a rejection reason');
      return;
    }

    try {
      await ApiService.put(`/prescriptions/${rejectDialog.prescriptionId}/reject`, {
        reason: rejectionReason
      });
      success('Prescription rejected');
      setRejectDialog({ isOpen: false, prescriptionId: null });
      setRejectionReason('');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      showError('Failed to reject prescription');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="text-yellow-600" size={20} />;
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isAdmin ? 'Prescriptions Review' : 'My Prescriptions'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'Review and approve customer prescriptions' : 'View your uploaded prescriptions'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <Upload size={18} className="mr-2" />
            Upload Prescription
          </Button>
        )}
      </div>

      {/* Upload Form for Customers */}
      {!isAdmin && (
        <Card className="bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="text-purple-600" size={20} />
            <h3 className="font-semibold text-purple-900">Quick Upload</h3>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="text-blue-600 mt-0.5" size={16} />
              <p className="text-sm text-blue-700">
                Note: In production, you would select a file from your device. This is a simplified version.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} fullWidth>
            Upload New Prescription
          </Button>
        </Card>
      )}

      {/* Prescriptions List */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Prescriptions ({prescriptions.length})
        </h2>
        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No prescriptions found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(prescription.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>File:</strong> {prescription.fileName}
                    </p>
                    {prescription.doctorName && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Doctor:</strong> Dr. {prescription.doctorName}
                      </p>
                    )}
                    {prescription.fileType && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Type:</strong> {prescription.fileType.toUpperCase()}
                      </p>
                    )}
                    {prescription.notes && (
                      <p className="text-gray-600 mb-2">
                        <strong>Notes:</strong> {prescription.notes}
                      </p>
                    )}
                    {prescription.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-800">{prescription.rejectionReason}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()}
                    </p>

                    {/* Admin Actions */}
                    {isAdmin && prescription.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprovePrescription(prescription.id)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectPrescription(prescription.id)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload Prescription</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadData.fileName}
                  onChange={(e) => setUploadData({ ...uploadData, fileName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="prescription.pdf"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadData.doctorName}
                  onChange={(e) => setUploadData({ ...uploadData, doctorName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Type
                </label>
                <select
                  value={uploadData.fileType}
                  onChange={(e) => setUploadData({ ...uploadData, fileType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="JPG">JPG</option>
                  <option value="PNG">PNG</option>
                  <option value="JPEG">JPEG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional information..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Prescription</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter reason for rejection..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="danger" onClick={handleRejectConfirm} fullWidth>
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectDialog({ isOpen: false, prescriptionId: null });
                  setRejectionReason('');
                }}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsScreen;