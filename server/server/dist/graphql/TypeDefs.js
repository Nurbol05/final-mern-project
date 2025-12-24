"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  scalar Date

  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
  }

  type Product {
    id: ID!
    title: String!
    description: String
    price: Float!
    stock: Int!
    imageUrl: String! # Добавили сюда
    category: Category!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    totalPrice: Float!
    status: String!
  }

  type Query {
    me: User
    categories: [Category!]!
    products(categoryId: ID): [Product!]!
    product(id: ID!): Product                 # 5-й запрос
    orders: [Order!]!                         # 4-й запрос
    getProducts: [Product!]!                  # 6-й запрос
  }

  type Mutation {
    register(email: String!, password: String!): String!
    login(email: String!, password: String!): String!
    createCategory(name: String!, description: String): Category!
    createProduct(
      title: String!, 
      description: String, 
      price: Float!, 
      stock: Int!, 
      categoryId: ID!, 
      imageUrl: String # Необязательное поле
    ): Product!
    createOrder(items: [OrderItemInput!]!): Order!
    updateProduct(
      id: ID!, 
      title: String, 
      price: Float, 
      stock: Int, 
      description: String, 
      imageUrl: String
    ): Product!
    deleteUser(id: ID!): User
    deleteProduct(id: ID!): Product         # 6-я мутация
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  type Subscription {
    orderCreated: Order!
  }
`;
