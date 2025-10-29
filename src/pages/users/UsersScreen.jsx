import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Users, Trash2, UserPlus, X } from 'lucide-react';

const UsersScreen = () => {
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ 
    isOpen: false, 
    userId: null, 
    userName: '' 
  });
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: 'CUSTOMER'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await ApiService.post('/auth/register', newUser);
      success(`User "${newUser.fullName}" added successfully!`);
      setShowModal(false);
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        role: 'CUSTOMER'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      showError(error.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteDialog({ 
      isOpen: true, 
      userId: user.id, 
      userName: user.fullName 
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await ApiService.delete(`/users/${deleteDialog.userId}`);
      success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Failed to delete user');
    } finally {
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  const handleUpdateRole = async (userId, currentRole, newRole) => {
    if (currentRole === newRole) return;

    try {
      await ApiService.put(`/users/${userId}/role`, { role: newRole });
      success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Failed to update user role');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      PHARMACIST: 'bg-blue-100 text-blue-800',
      CUSTOMER: 'bg-green-100 text-green-800',
      USER: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus size={18} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user.fullName}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user.id, user.role, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteClick(user)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                label="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                required
              />

              <Input
                label="Phone Number"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                placeholder="+1 234 567 8900"
                required
              />

              <Input
                label="Address"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                placeholder="123 Main St, City"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  Add User
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteDialog.userName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default UsersScreen;