import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { Package, ShoppingCart, FileText, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingPrescriptions: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/dashboard/stats');
      console.log('Dashboard stats:', data);
      
      // Handle different response structures
      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          pendingPrescriptions: data.pendingPrescriptions || 0,
          activeUsers: data.activeUsers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load dashboard statistics');
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        pendingPrescriptions: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package size={24} />}
          color="blue"
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart size={24} />}
          color="green"
        />
        <DashboardCard
          title="Pending Prescriptions"
          value={stats.pendingPrescriptions}
          icon={<FileText size={24} />}
          color="yellow"
        />
        <DashboardCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users size={24} />}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600">Your recent activities will appear here.</p>
      </div>
    </div>
  );
};

export default Dashboard;