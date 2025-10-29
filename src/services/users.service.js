// FILE: src/services/users.service.js
import ApiService from './api.service';

export const usersService = {
  getAll: () => {
    return ApiService.get('/users');
  },

  updateRole: (userId, role) => {
    return ApiService.put(`/users/${userId}/role`, { role });
  },

  delete: (userId) => {
    return ApiService.delete(`/users/${userId}`);
  }
};

export default usersService;