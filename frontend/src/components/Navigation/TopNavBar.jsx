import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function TopNavBar({ onToggleSidebar }) {
  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.length;

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-4 shadow-[0_24_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4 md:gap-12">
        <button 
          onClick={onToggleSidebar}
          className="hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5 disabled:opacity-50"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <Link to="/" className="text-2xl font-bold tracking-tight text-white hidden sm:block hover:text-primary transition-colors">CartZen</Link>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link to="/" className="text-emerald-400 font-semibold transition-colors duration-300">Shop</Link>
          <a className="text-neutral-400 hover:text-emerald-300 transition-colors duration-300" href="#">Curated</a>
          <a className="text-neutral-400 hover:text-emerald-300 transition-colors duration-300" href="#">Sommelier's Pick</a>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <input className="bg-surface-container-highest border-none rounded-full px-6 py-2 w-80 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-neutral-500" placeholder="Search curated collection..." type="text"/>
          <span className="material-symbols-outlined absolute right-4 top-2 text-neutral-500 text-lg">search</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary-container text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
