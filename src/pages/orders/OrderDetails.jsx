// FILE: src/pages/orders/OrderDetails.jsx
import React from 'react';
import Modal from '../../components/common/Modal';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';

export const OrderDetails = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order #${order.id}`} size="lg">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status, 'order')}`}>
            {order.status}
          </span>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-1">
            <p className="text-sm"><span className="font-medium">Name:</span> {order.userName || 'N/A'}</p>
            <p className="text-sm"><span className="font-medium">Email:</span> {order.userEmail || 'N/A'}</p>
            <p className="text-sm"><span className="font-medium">Phone:</span> {order.userPhone || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm">{order.deliveryAddress || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetails;