import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, ShoppingCart, Edit, Trash2, Search, X, Package, TrendingUp, AlertCircle } from 'lucide-react';

const ProductsScreen = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null, productName: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    manufacturer: '',
    imageUrl: ''
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    try {
      addToCart(product, 1);
      success(`${product.name} added to cart!`);
    } catch (error) {
      showError('Failed to add product to cart');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category || '',
        manufacturer: product.manufacturer || '',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        manufacturer: '',
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
      manufacturer: '',
      imageUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await ApiService.put(`/products/${editingProduct.id}`, formData);
        success('Product updated successfully!');
      } else {
        await ApiService.post('/products', formData);
        success('Product added successfully!');
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteDialog({ 
      isOpen: true, 
      productId: product.id, 
      productName: product.name 
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await ApiService.delete(`/products/${deleteDialog.productId}`);
      success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Failed to delete product');
    } finally {
      setDeleteDialog({ isOpen: false, productId: null, productName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, productId: null, productName: '' });
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockIcon = (stockQuantity) => {
    if (stockQuantity > 50) return <Package className="text-green-600" size={20} />;
    if (stockQuantity > 10) return <TrendingUp className="text-yellow-600" size={20} />;
    return <AlertCircle className="text-red-600" size={20} />;
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
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image Container with Gradient Overlay */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                <Package className="text-gray-300" size={64} />
              </div>
              
              {/* Stock Badge */}
              <div className="absolute top-3 right-3">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-sm ${
                  product.stockQuantity > 50
                    ? 'bg-green-100/90 text-green-800'
                    : product.stockQuantity > 10
                    ? 'bg-yellow-100/90 text-yellow-800'
                    : 'bg-red-100/90 text-red-800'
                }`}>
                  {getStockIcon(product.stockQuantity)}
                  <span className="text-xs font-semibold">{product.stockQuantity}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              {/* Category & Manufacturer */}
              <div className="flex gap-2 mb-3">
                {product.category && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {product.category}
                  </span>
                )}
                {product.manufacturer && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    {product.manufacturer}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  ${product.price?.toFixed(2)}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                {product.stockQuantity > 0 && !isAdmin && (
                  <Button
                    fullWidth
                    onClick={() => handleAddToCart(product)}
                    className="group-hover:shadow-lg transition-shadow"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Add to Cart
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenModal(product)}
                      className="flex-1"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-xl pointer-events-none transition-all duration-300"></div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No products found matching your search' : 'No products found'}
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Paracetamol 500mg"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Product description..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="9.99"
                  required
                />

                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Pain Relief"
                />

                <Input
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Pharma Corp"
                />
              </div>

              <Input
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ProductsScreen;