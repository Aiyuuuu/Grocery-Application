import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../ProductCard/ProductCard';
import styles from './HomeSections.module.css';

export default function CategoriesSection() {
  const categories = useSelector((state) => state.categories?.items || []);
  const allProducts = useSelector((state) => state.products?.items || []);

  return (
    <div className="space-y-12 pb-12">
      {categories.map((category) => {
        // Find products that match this category by id
        const categoryProducts = category.productIds
          .map(id => allProducts.find(p => p.id === id))
          .filter(Boolean);

        // Don't render the section if there are no matching products
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.name}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-headline font-bold">{category.name}</h2>
              <div className="h-[1px] flex-grow bg-neutral-800"></div>
              <button className="text-primary text-sm font-semibold hover:underline whitespace-nowrap flex-shrink-0">
                Explore all picks
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
