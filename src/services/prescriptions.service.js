// FILE: src/services/prescriptions.service.js
import ApiService from './api.service';

export const prescriptionsService = {
  getAll: () => {
    return ApiService.get('/prescriptions');
  },

  getUserPrescriptions: (userId) => {
    return ApiService.get(`/prescriptions/user/${userId}`);
  },

  getPending: () => {
    return ApiService.get('/prescriptions/pending');
  },

  upload: (prescriptionData) => {
    const params = new URLSearchParams({
      userId: prescriptionData.userId,
      fileName: prescriptionData.fileName,
      fileType: prescriptionData.fileType,
      doctorName: prescriptionData.doctorName,
      ...(prescriptionData.notes && { notes: prescriptionData.notes })
    });
    return ApiService.post(`/prescriptions/upload?${params}`);
  },

  approve: (id) => {
    return ApiService.put(`/prescriptions/${id}/approve`);
  },

  reject: (id, reason) => {
    return ApiService.put(`/prescriptions/${id}/reject`, { reason });
  }
};

export default prescriptionsService;

