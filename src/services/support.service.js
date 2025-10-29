// FILE: src/services/support.service.js
import ApiService from './api.service';

export const supportService = {
  getAllTickets: () => {
    return ApiService.get('/support/tickets/all');
  },

  getUserTickets: () => {
    return ApiService.get('/support/tickets');
  },

  getTicketById: (id) => {
    return ApiService.get(`/support/ticket/${id}`);
  },

  createTicket: (ticketData) => {
    return ApiService.post('/support/ticket', ticketData);
  },

  updateStatus: (id, status) => {
    return ApiService.put(`/support/ticket/${id}/status`, { status });
  },

  addResponse: (id, response) => {
    return ApiService.post(`/support/ticket/${id}/response`, { response });
  }
};

export default supportService;