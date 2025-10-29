import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Card from '../../components/common/Card';
import { TrendingUp, Package, Users, FileText, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const AnalyticsScreen = () => {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    sales: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0
    },
    inventory: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStock: 0,
      totalValue: 0
    },
    users: {
      totalUsers: 0,
      customers: 0,
      pharmacists: 0,
      admins: 0
    },
    prescriptions: {
      totalPrescriptions: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    support: {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/dashboard/analytics');
      console.log('Analytics data:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
      </div>

      {/* Sales Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" size={24} />
          Sales Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${analytics.sales.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="text-green-600" size={40} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.sales.totalOrders || 0}
                </p>
              </div>
              <ShoppingCart className="text-blue-600" size={40} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${analytics.sales.averageOrderValue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="text-purple-600" size={40} />
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Status */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-blue-600" size={24} />
          Inventory Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Products</p>
              <p className="text-4xl font-bold text-blue-600">
                {analytics.inventory.totalProducts || 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Value</p>
              <p className="text-4xl font-bold text-green-600">
                ${analytics.inventory.totalValue?.toFixed(0) || '0'}
              </p>
            </div>
          </Card>

          <Card className="bg-yellow-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Low Stock Items</p>
              <p className="text-4xl font-bold text-yellow-600">
                {analytics.inventory.lowStockProducts || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-red-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Out of Stock</p>
              <p className="text-4xl font-bold text-red-600">
                {analytics.inventory.outOfStock || 0}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-purple-600" size={24} />
          User Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Users</p>
              <p className="text-4xl font-bold text-purple-600">
                {analytics.users.totalUsers || 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Customers</p>
              <p className="text-4xl font-bold text-green-600">
                {analytics.users.customers || 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pharmacists</p>
              <p className="text-4xl font-bold text-blue-600">
                {analytics.users.pharmacists || 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Admins</p>
              <p className="text-4xl font-bold text-red-600">
                {analytics.users.admins || 0}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Prescriptions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="text-indigo-600" size={24} />
          Prescriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <FileText className="text-gray-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics.prescriptions.totalPrescriptions || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-yellow-50">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.prescriptions.pending || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.prescriptions.approved || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-red-50">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.prescriptions.rejected || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Support Tickets */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={24} />
          Support Tickets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Tickets</p>
              <p className="text-4xl font-bold text-gray-800">
                {analytics.support.totalTickets || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-orange-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Open Tickets</p>
              <p className="text-4xl font-bold text-orange-600">
                {analytics.support.openTickets || 0}
              </p>
            </div>
          </Card>

          <Card className="bg-green-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Resolved Tickets</p>
              <p className="text-4xl font-bold text-green-600">
                {analytics.support.resolvedTickets || 0}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;