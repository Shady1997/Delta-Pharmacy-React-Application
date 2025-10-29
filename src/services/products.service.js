// FILE: src/services/products.service.js
import ApiService from './api.service';

export const productsService = {
  getAll: () => {
    return ApiService.get('/products');
  },

  getById: (id) => {
    return ApiService.get(`/products/${id}`);
  },

  create: (productData) => {
    return ApiService.post('/products', productData);
  },

  update: (id, productData) => {
    return ApiService.put(`/products/${id}`, productData);
  },

  delete: (id) => {
    return ApiService.delete(`/products/${id}`);
  },

  search: (query) => {
    return ApiService.get(`/search?query=${query}`);
  },

  getLowStock: () => {
    return ApiService.get('/inventory/stock-levels');
  },

  updateStock: (stockData) => {
    return ApiService.post('/inventory/update-stock', stockData);
  }
};

export default productsService;

