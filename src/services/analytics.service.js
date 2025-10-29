// FILE: src/services/analytics.service.js
import ApiService from './api.service';

export const analyticsService = {
  getDashboardStats: () => {
    return ApiService.get('/dashboard/stats');
  },

  getAnalytics: () => {
    return ApiService.get('/dashboard/analytics');
  },

  getSalesReport: () => {
    return ApiService.get('/reports/sales');
  },

  getInventoryReport: () => {
    return ApiService.get('/reports/inventory');
  },

  getUsersReport: () => {
    return ApiService.get('/reports/users');
  }
};

export default analyticsService;