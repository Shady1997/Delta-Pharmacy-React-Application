import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useCart } from '../../hooks/useCart';
import ApiService from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, CreditCard, Banknote, X, MoreVertical } from 'lucide-react';

const OrdersScreen = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { cart, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, orderId: null });
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'CASH'
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      
      if (isAdmin) {
        data = await ApiService.get('/orders');
      } else {
        data = await ApiService.get(`/orders/${user.id}`);
      }
      
      console.log('Orders data:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.id, showError]);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [fetchOrders, user?.id]);

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showError('Your cart is empty');
      return;
    }

    if (!orderData.shippingAddress.trim()) {
      showError('Please enter shipping address');
      return;
    }

    setShowCheckout(false);
    
    if (orderData.paymentMethod === 'CARD') {
      setShowPayment(true);
    } else {
      handleCreateOrder();
    }
  };

  const handleCreateOrder = async () => {
    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderPayload = {
        userId: user.id,
        items: items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod
      };

      console.log('Creating order:', orderPayload);
      
      const order = await ApiService.post('/orders', orderPayload);
      console.log('Order created:', order);
      
      setCreatedOrderId(order.id);
      
      if (orderData.paymentMethod === 'CARD') {
        await handlePayment(order.id);
      } else {
        success('Order placed successfully! Pay on delivery.');
        clearCart();
        resetForms();
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showError(error.response?.data?.message || 'Failed to create order');
    }
  };

  const handlePayment = async (orderId) => {
    try {
      if (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryDate || !paymentData.cvv) {
        showError('Please fill in all payment details');
        return;
      }

      if (paymentData.cvv.length !== 3) {
        showError('CVV must be 3 digits');
        return;
      }

      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(paymentData.expiryDate)) {
        showError('Expiry date must be in MM/YY format');
        return;
      }

      const [month, year] = paymentData.expiryDate.split('/');

      const paymentPayload = {
        orderId: orderId,
        userId: user.id,
        cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
        cardHolderName: paymentData.cardHolder,
        expiryMonth: month,
        expiryYear: year,
        cvv: paymentData.cvv
      };

      console.log('Initiating payment:', paymentPayload);
      
      const payment = await ApiService.post('/payments/initiate', paymentPayload);
      console.log('Payment initiated:', payment);

      try {
        await ApiService.post('/payments/verify', {
          paymentId: payment.id,
          transactionId: payment.transactionId || `TXN${Date.now()}`,
          status: 'COMPLETED'
        });
        
        success('Payment successful! Order placed.');
      } catch (verifyError) {
        console.warn('Payment verification skipped:', verifyError);
        success('Order placed successfully!');
      }

      clearCart();
      resetForms();
      fetchOrders();
    } catch (error) {
      console.error('Error processing payment:', error);
      showError(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ApiService.put(`/orders/${orderId}/status`, { status: newStatus });
      success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
    }
  };

  const handleCancelOrderClick = (orderId) => {
    setCancelDialog({ isOpen: true, orderId });
  };

  const handleCancelOrderConfirm = async () => {
    try {
      await ApiService.delete(`/orders/${cancelDialog.orderId}`);
      success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Failed to cancel order');
    } finally {
      setCancelDialog({ isOpen: false, orderId: null });
    }
  };

  const resetForms = () => {
    setShowCheckout(false);
    setShowPayment(false);
    setOrderData({ shippingAddress: '', paymentMethod: 'CASH' });
    setPaymentData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    setCreatedOrderId(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Package className="text-yellow-600" size={20} />;
      case 'PROCESSING':
        return <ShoppingCart className="text-blue-600" size={20} />;
      case 'SHIPPED':
        return <Truck className="text-purple-600" size={20} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Package className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
            {isAdmin ? 'Orders Management' : 'My Orders'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'View and manage all customer orders' : 'Track your order history'}
          </p>
        </div>
        {!isAdmin && cart.length > 0 && (
          <Button onClick={() => setShowCheckout(true)}>
            <ShoppingCart size={18} className="mr-2" />
            Checkout ({cart.length} items)
          </Button>
        )}
      </div>

      {/* Cart Summary */}
      {!isAdmin && cart.length > 0 && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Shopping Cart</h3>
              <p className="text-sm text-gray-600">{cart.length} items in cart</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${getCartTotal().toFixed(2)}</p>
              <Button 
                size="sm" 
                onClick={() => setShowCheckout(true)}
                className="mt-2"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No orders found</p>
            {!isAdmin && cart.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">Add products to cart to create an order</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Shipping:</strong> {order.shippingAddress}
                      </p>
                    )}

                    {order.paymentMethod && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Payment:</strong> {order.paymentMethod}
                      </p>
                    )}

                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                        <ul className="space-y-1">
                          {order.orderItems.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {item.product?.name || 'Product'} × {item.quantity} - ${item.price?.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        Total: ${order.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrderClick(order.id)}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={orderData.shippingAddress}
                  onChange={(e) => setOrderData({ ...orderData, shippingAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter your shipping address..."
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderData({ ...orderData, paymentMethod: 'CASH' })}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      orderData.paymentMethod === 'CASH'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Banknote size={32} className={orderData.paymentMethod === 'CASH' ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="font-medium">Cash on Delivery</span>
                  </button>
                  <button
                    onClick={() => setOrderData({ ...orderData, paymentMethod: 'CARD' })}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      orderData.paymentMethod === 'CARD'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <CreditCard size={32} className={orderData.paymentMethod === 'CARD' ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="font-medium">Credit/Debit Card</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleProceedToPayment} fullWidth>
                  {orderData.paymentMethod === 'CASH' ? 'Place Order' : 'Proceed to Payment'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowCheckout(false)}
                  fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard size={28} />
                Payment Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Card Number"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                placeholder="4111 1111 1111 1111"
                maxLength="19"
                required
              />

              <Input
                label="Card Holder Name"
                value={paymentData.cardHolder}
                onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                placeholder="John Doe"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date (Future)"
                  value={paymentData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setPaymentData({ ...paymentData, expiryDate: value });
                  }}
                  placeholder="MM/YY (e.g., 12/26)"
                  maxLength="5"
                  required
                />

                <Input
                  label="CVV"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                  placeholder="123"
                  maxLength="3"
                  type="password"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateOrder} fullWidth>
                  Pay Now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPayment(false);
                    setShowCheckout(true);
                  }}
                  fullWidth
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation */}
      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        onConfirm={handleCancelOrderConfirm}
        onCancel={() => setCancelDialog({ isOpen: false, orderId: null })}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        type="danger"
      />
    </div>
  );
};

export default OrdersScreen;