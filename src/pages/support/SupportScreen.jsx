import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Plus, MessageSquare, X, Flag } from 'lucide-react';

const SupportScreen = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [responseDialog, setResponseDialog] = useState({ isOpen: false, ticketId: null });
  const [responseText, setResponseText] = useState('');
  const [newTicket, setNewTicket] = useState({ 
    subject: '', 
    description: '',
    priority: 'MEDIUM'
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (isAdmin) {
        data = await ApiService.get('/support/tickets/all');
      } else {
        data = await ApiService.get('/support/tickets');
      }
      
      console.log('Tickets data:', data);
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showError]);

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [fetchTickets, user?.id]);

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      showError('Please fill in all fields');
      return;
    }

    try {
      await ApiService.post('/support/ticket', {
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority
      });
      success('Support ticket created successfully!');
      setShowModal(false);
      setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      showError('Failed to create ticket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await ApiService.put(`/support/ticket/${ticketId}/status`, { status: newStatus });
      success(`Ticket status updated to ${newStatus}`);
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showError('Failed to update ticket status');
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      showError('Please enter a response');
      return;
    }

    try {
      await ApiService.post(`/support/ticket/${responseDialog.ticketId}/response`, {
        response: responseText
      });
      success('Response added successfully');
      setResponseDialog({ isOpen: false, ticketId: null });
      setResponseText('');
      fetchTickets();
    } catch (error) {
      console.error('Error adding response:', error);
      showError('Failed to add response');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      URGENT: 'text-red-600',
      HIGH: 'text-orange-600',
      MEDIUM: 'text-blue-600',
      LOW: 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getPriorityBgColor = (priority) => {
    const colors = {
      URGENT: 'bg-red-100',
      HIGH: 'bg-orange-100',
      MEDIUM: 'bg-blue-100',
      LOW: 'bg-gray-100'
    };
    return colors[priority] || 'bg-gray-100';
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
            {isAdmin ? 'Support Tickets Management' : 'My Support Tickets'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'View and respond to customer support tickets' : 'Create and track your support requests'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-2" />
            New Ticket
          </Button>
        )}
      </div>

      {/* Create Ticket Form for Customers */}
      {!isAdmin && (
        <Card className="bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="text-orange-600" size={20} />
            <h3 className="font-semibold text-orange-900">Quick Ticket</h3>
          </div>
          <Button onClick={() => setShowModal(true)} fullWidth>
            Create Support Ticket
          </Button>
        </Card>
      )}

      {/* Tickets List */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Support Tickets ({tickets.length})
        </h2>
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No support tickets found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {ticket.subject}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      {ticket.priority && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${getPriorityBgColor(ticket.priority)}`}>
                          <Flag size={14} className={getPriorityColor(ticket.priority)} />
                          <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{ticket.description}</p>
                    {ticket.response && (
                      <div className="bg-blue-50 p-3 rounded-lg mt-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{ticket.response}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex gap-2">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => setResponseDialog({ isOpen: true, ticketId: ticket.id })}
                          >
                            Add Response
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Support Ticket</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Detailed description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateTicket} fullWidth>
                  Submit
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)} fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Dialog */}
      {responseDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Response</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter your response..."
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddResponse} fullWidth>
                Send Response
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResponseDialog({ isOpen: false, ticketId: null });
                  setResponseText('');
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

export default SupportScreen;