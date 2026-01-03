
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Product } from '../../types';
import { inventoryService } from '../../graphql/inventoryService';

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findProduct, addProduct, updateProduct, currentUser } = useAppContext();
  const { notifications } = useNotifications({ userId: currentUser?.id });
  
  const isEditing = Boolean(id);
  const [product, setProduct] = useState<Omit<Product, 'id'> | Product>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    stock: 0,
    sizes: [],
    colors: [],
    isNewArrival: false,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existingProduct = findProduct(id);
      if (existingProduct) {
        setProduct(existingProduct);
        setImagePreview(existingProduct.image);
      } else {
        navigate('/admin/products');
      }
    }
  }, [id, isEditing, findProduct, navigate]);

  // Listen for inventory notifications
  useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification) {
      // Check for inventory success events
      if (latestNotification.type === 'success' && 
          (latestNotification.eventType === 'ITEM_UPDATED_SUCCESS' || 
           latestNotification.eventType === 'ITEM_CREATED_SUCCESS')) {
        setStatusMessage(`✅ ${latestNotification.message || 'Product saved successfully!'}`);
        setShowSuccess(true);
        setIsUploading(false);
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else if (latestNotification.type === 'error' && 
                 (latestNotification.eventType === 'ITEM_UPDATED_FAILED' || 
                  latestNotification.eventType === 'ITEM_CREATED_FAILED')) {
        setStatusMessage(`❌ ${latestNotification.message || 'Failed to save product'}`);
        setIsUploading(false);
        setTimeout(() => {
          setStatusMessage('');
        }, 5000);
      }
    }
  }, [notifications, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && 'checked' in e.target) {
        setProduct(prev => ({ ...prev, [name]: e.target.checked }));
        return;
    }
    
    if (name === 'sizes' || name === 'colors') {
        setProduct(prev => ({...prev, [name]: value.split(',').map(s => s.trim())}));
        return;
    }

    setProduct(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setStatusMessage('');
    setShowSuccess(false);

    try {
      let imageUrl = product.image;

      // Upload new image if file is selected
      if (selectedFile) {
        setStatusMessage('📤 Uploading image...');
        const uploadResult = await inventoryService.uploadImage(selectedFile);
        imageUrl = uploadResult.path;
        setStatusMessage('✅ Image uploaded successfully!');
      }

      // Prepare product data
      const productData = {
        ...product,
        image: imageUrl
      };

      if (isEditing) {
        setStatusMessage('📡 Publishing inventory update event...');
        await updateProduct(productData as Product);
        setStatusMessage('✅ Inventory event published. Processing...');
      } else {
        setStatusMessage('📡 Publishing inventory creation event...');
        await addProduct(productData as Omit<Product, 'id'>);
        setStatusMessage('✅ Inventory event published. Processing...');
      }

      // Don't navigate immediately - wait for notification
      // Keep isUploading true while waiting for notification
    } catch (error) {
      console.error('Error saving product:', error);
      setStatusMessage('❌ Failed to save product. Please try again.');
      setIsUploading(false);
      setTimeout(() => {
        setStatusMessage('');
      }, 5000);
    }
  };

  // Helper function to extract username from email
  const getUsernameFromEmail = (email: string | undefined): string => {
    if (!email) return 'User';
    return email.split('@')[0];
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        {currentUser?.email && (
          <p className="text-gray-600 mt-2">
            Hi {getUsernameFromEmail(currentUser.email)}
          </p>
        )}
      </div>
      
      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          showSuccess 
            ? 'bg-green-100 text-green-800' 
            : statusMessage.includes('❌') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
        }`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={4} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input type="number" name="price" id="price" value={product.price} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" name="stock" id="stock" value={product.stock} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
        </div>
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" value={product.category} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="">Select a category</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">Accessories</option>
            </select>
        </div>
         <div>
          <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">Sizes (comma-separated)</label>
          <input type="text" name="sizes" id="sizes" value={product.sizes.join(', ')} onChange={handleChange} placeholder="S, M, L, XL" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colors (comma-separated)</label>
          <input type="text" name="colors" id="colors" value={product.colors.join(', ')} onChange={handleChange} placeholder="Red, Blue, Black" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        
        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
          {imagePreview && (
            <div className="mt-2 mb-2">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
            </div>
          )}
          <input 
            type="file" 
            name="image" 
            id="image" 
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">Upload a product image (JPG, PNG, GIF, WebP - max 5MB)</p>
        </div>

        <div className="flex items-center">
          <input type="checkbox" name="isNewArrival" id="isNewArrival" checked={product.isNewArrival} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label htmlFor="isNewArrival" className="ml-2 block text-sm text-gray-900">New Arrival</label>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={isUploading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {isUploading ? 'Processing...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
