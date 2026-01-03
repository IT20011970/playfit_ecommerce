import { graphqlClient } from './client';
import {
  GET_ALL_PRODUCTS,
  GET_PRODUCT,
  ADD_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  SEED_PRODUCTS,
} from './inventoryQueries';

interface CreateProductInput {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string[];
  colors: string[];
  isNewArrival: boolean;
}

interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  isNewArrival?: boolean;
}

export const inventoryService = {
  async getAllProducts() {
    const result = await graphqlClient.query(GET_ALL_PRODUCTS);
    return result.products || [];
  },

  async getProduct(id: string) {
    const result = await graphqlClient.query(GET_PRODUCT, { id });
    return result.product;
  },

  async addProduct(input: CreateProductInput) {
    const result = await graphqlClient.mutate(ADD_PRODUCT, { input });
    return result.addProduct;
  },

  async updateProduct(input: UpdateProductInput) {
    const result = await graphqlClient.mutate(UPDATE_PRODUCT, { input });
    return result.updateProduct;
  },

  async deleteProduct(id: string) {
    const result = await graphqlClient.mutate(DELETE_PRODUCT, { id });
    return result.deleteProduct;
  },

  async seedProducts(products: CreateProductInput[]) {
    const result = await graphqlClient.mutate(SEED_PRODUCTS, { products });
    return result.seedProducts;
  },

  async uploadImage(file: File): Promise<{ path: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  },
};
