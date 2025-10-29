// FILE: src/pages/products/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { productsService } from '../../services/products.service';
import { AlertCircle } from 'lucide-react';

export const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    prescriptionRequired: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stockQuantity: product.stockQuantity || '',
        category: product.category || '',
        prescriptionRequired: product.prescriptionRequired || false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        prescriptionRequired: false
      });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (product) {
        await productsService.update(product.id, formData);
      } else {
        await productsService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter product name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Price"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
          />

          <Input
            type="number"
            label="Stock Quantity"
            value={formData.stockQuantity}
            onChange={(e) => handleChange('stockQuantity', e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="Enter category"
          required
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="prescriptionRequired"
            checked={formData.prescriptionRequired}
            onChange={(e) => handleChange('prescriptionRequired', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="prescriptionRequired" className="text-sm text-gray-700">
            Prescription Required
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;