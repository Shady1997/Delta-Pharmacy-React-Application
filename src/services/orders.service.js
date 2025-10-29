// FILE: src/services/orders.service.js
import ApiService from './api.service';

export const ordersService = {
  getAll: () => {
    return ApiService.get('/orders');
  },

  getUserOrders: (userId) => {
    return ApiService.get(`/orders/${userId}`);
  },

  create: (orderData) => {
    return ApiService.post('/orders', orderData);
  },

  updateStatus: (id, status) => {
    return ApiService.put(`/orders/${id}/status`, { status });
  },

  cancel: (id) => {
    return ApiService.delete(`/orders/${id}`);
  }
};

export default ordersService;