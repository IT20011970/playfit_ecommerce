export const GET_ALL_PRODUCTS = `
  query GetAllProducts {
    products {
      id
      name
      description
      price
      image
      category
      stock
      sizes
      colors
      isNewArrival
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      image
      category
      stock
      sizes
      colors
      isNewArrival
      createdAt
      updatedAt
    }
  }
`;

export const ADD_PRODUCT = `
  mutation AddProduct($input: CreateProductInput!) {
    addProduct(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      success
      message
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;

export const SEED_PRODUCTS = `
  mutation SeedProducts($products: [CreateProductInput!]!) {
    seedProducts(products: $products) {
      id
      name
      stock
    }
  }
`;
