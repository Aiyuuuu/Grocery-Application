import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import ProductDetailsPage from '../pages/ProductDetailsPage/ProductDetailsPage';
import CartPage from '../pages/CartPage/CartPage';
import NotFoundPage from '../pages/404Page/NotFoundPage';
import AppLayout from '../components/Layout/AppLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
