import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Card from '../../components/common/Card';
import { Package, ShoppingCart, FileText, Users, Clock, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingPrescriptions: 0,
    activeUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/dashboard/stats');
      console.log('Dashboard stats:', data);
      
      setStats({
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        pendingPrescriptions: data.pendingPrescriptions || 0,
        activeUsers: data.totalUsers || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load dashboard statistics');
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

  const fetchRecentActivities = useCallback(async () => {
    try {
      if (isAdmin) {
        // Admin sees all activities
        const [orders, prescriptions, tickets] = await Promise.all([
          ApiService.get('/orders').catch(() => []),
          ApiService.get('/prescriptions').catch(() => []),
          ApiService.get('/support/tickets/all').catch(() => [])
        ]);

        const activities = [
          ...(orders || []).slice(0, 3).map(order => ({
            type: 'order',
            title: `Order #${order.id}`,
            description: `${order.status} - $${order.totalAmount?.toFixed(2)}`,
            timestamp: order.createdAt,
            icon: 'ShoppingCart',
            color: 'blue'
          })),
          ...(prescriptions || []).slice(0, 3).map(prescription => ({
            type: 'prescription',
            title: `Prescription #${prescription.id}`,
            description: `${prescription.status} - ${prescription.fileName}`,
            timestamp: prescription.uploadedAt,
            icon: 'FileText',
            color: 'yellow'
          })),
          ...(tickets || []).slice(0, 3).map(ticket => ({
            type: 'ticket',
            title: `Support Ticket #${ticket.id}`,
            description: `${ticket.status} - ${ticket.subject}`,
            timestamp: ticket.createdAt,
            icon: 'MessageSquare',
            color: 'green'
          }))
        ];

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivities(activities.slice(0, 5));
      } else {
        // Customer sees only their own activities
        const [myOrders, myPrescriptions, myTickets] = await Promise.all([
          ApiService.get(`/orders/${user.id}`).catch(() => []),
          ApiService.get(`/prescriptions/user/${user.id}`).catch(() => []),
          ApiService.get('/support/tickets').catch(() => [])
        ]);

        const activities = [
          ...(myOrders || []).slice(0, 3).map(order => ({
            type: 'order',
            title: `Order #${order.id}`,
            description: `${order.status} - $${order.totalAmount?.toFixed(2)}`,
            timestamp: order.createdAt,
            icon: 'ShoppingCart',
            color: 'blue'
          })),
          ...(myPrescriptions || []).slice(0, 3).map(prescription => ({
            type: 'prescription',
            title: `Prescription #${prescription.id}`,
            description: `${prescription.status} - ${prescription.fileName}`,
            timestamp: prescription.uploadedAt,
            icon: 'FileText',
            color: 'yellow'
          })),
          ...(myTickets || []).slice(0, 3).map(ticket => ({
            type: 'ticket',
            title: `Support Ticket #${ticket.id}`,
            description: `${ticket.status} - ${ticket.subject}`,
            timestamp: ticket.createdAt,
            icon: 'MessageSquare',
            color: 'green'
          }))
        ];

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivities(activities.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  }, [isAdmin, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchStats();
        await fetchRecentActivities();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getActivityIcon = (iconName, color) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    const icons = {
      ShoppingCart: <ShoppingCart size={18} />,
      FileText: <FileText size={18} />,
      MessageSquare: <MessageSquare size={18} />
    };

    return (
      <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
        {icons[iconName] || <Clock size={18} />}
      </div>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package size={24} />}
          color="blue"
        />
        <DashboardCard
          title={isAdmin ? "Total Orders" : "My Orders"}
          value={stats.totalOrders}
          icon={<ShoppingCart size={24} />}
          color="green"
        />
        <DashboardCard
          title={isAdmin ? "Pending Prescriptions" : "My Prescriptions"}
          value={stats.pendingPrescriptions}
          icon={<FileText size={24} />}
          color="yellow"
        />
        {isAdmin && (
          <DashboardCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<Users size={24} />}
            color="purple"
          />
        )}
      </div>

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isAdmin ? 'Recent Activity' : 'My Recent Activity'}
        </h2>
        {recentActivities.length === 0 ? (
          <p className="text-gray-600">No recent activities</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getActivityIcon(activity.icon, activity.color)}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;