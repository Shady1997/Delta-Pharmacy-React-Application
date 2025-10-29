// FILE: src/pages/prescriptions/UploadPrescriptionModal.jsx
import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { prescriptionsService } from '../../services/prescriptions.service';
import { Upload, AlertCircle } from 'lucide-react';

export const UploadPrescriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fileName: '',
    fileType: 'PDF',
    doctorName: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await prescriptionsService.upload({
        ...formData,
        userId: user.id
      });
      onSuccess();
      onClose();
      setFormData({
        fileName: '',
        fileType: 'PDF',
        doctorName: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Prescription"
      size="md"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="File Name"
          value={formData.fileName}
          onChange={(e) => handleChange('fileName', e.target.value)}
          placeholder="prescription_document.pdf"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.fileType}
            onChange={(e) => handleChange('fileType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="PDF">PDF</option>
            <option value="IMAGE">Image</option>
            <option value="DOC">Document</option>
          </select>
        </div>

        <Input
          label="Doctor Name"
          value={formData.doctorName}
          onChange={(e) => handleChange('doctorName', e.target.value)}
          placeholder="Dr. John Smith"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Any additional notes or instructions..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={loading} icon={Upload}>
            {loading ? 'Uploading...' : 'Upload Prescription'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadPrescriptionModal;