import { useSelector } from 'react-redux';
import { selectCategoriesWithProducts } from '../../store/selectors';
import ProductCard from '../ProductCard/ProductCard';

export default function CategoriesSection() {
  const categories = useSelector(selectCategoriesWithProducts);

  return (
    <div className="space-y-12 pb-12">
      {categories.map((category) => {
        if (category.products.length === 0) return null;

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
              {category.products.map((product) => (
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
