import { createSlice } from '@reduxjs/toolkit';
import { normalizeSearchQuery } from '../../utils/search';

const normalizeUnitWeight = (saleType, unitWeight) => {
  if (saleType === 'variable') return null;
  const numericWeight = Number(unitWeight);
  return Number.isFinite(numericWeight) ? numericWeight : null;
};

const normalizeProduct = (product) => ({
  ...product,
  unit_weight: normalizeUnitWeight(product.saleType, product.unit_weight),
});

const initialProducts = [
  {
    id: 'prod-1',
    name: 'Manuka Honey Gold',
    price: 68.0,
    description: '500+ MGO Certified',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe',
    calories: 300,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 500,
    tags: ['Organic', 'Premium'],
    recommended: true,
  },
  {
    id: 'prod-2',
    name: 'Raw Almond Bliss',
    price: 15.0,
    description: 'Sprouted, Organic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIpLJ3B5I3c9epJDKyGCxqU0AT9p_5G_0-vMMDSEapbUTMPPAsurnND6shcU8AJ46yp8O7uk6mMPEqVFRHD_uRGQHunKfhCBMv9or_IUEmgrKPn9wPmpRqXQxQgJWx0ZEc2C_ScbWPkXSwBaYgvnoL2afh1lyy6ApsNiDa9G-SNUeQsjc58dI-lBSrr1FhLeMmr9idoqbEcEJTDQKpztdWlXLsNszxrPXPX--JmNeim7ZIDD4pI6FL4G-Wn_08Kp5aDUkaSjVWfNZV',
    calories: 450,
    saleType: 'variable',
    unit: 'kg',
    unit_weight: null,
    tags: ['Fresh', 'Keto'],
    recommended: false,
  },
  {
    id: 'prod-3',
    name: 'Greek Silk Yogurt',
    price: 9.5,
    description: 'A2 Cultured Dairy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg7eBQw3CinRkiGlp9Vmf8Sj8W6uRo6jkLhZ83iJYO48Ew7QVVIidIts2gs_G-t26kqP-Zh_XeFI9el4fLd17lRifqAJuTmogZmHRhCK9QqxFcywV26U-9VtLXdHhM0V8CDvfY4iMyDF4dsqTLOgrW_peZ2Y0TmUAvMo33phEhAA-Y46U2ttJJ_iNTvQpF_SBuJEXjbEyRy4PQbaINesMB6czopDy6zbqBHPXOt-QNx96JQuaZPKjWLxKlXAAfxxCpSAa2tzUG773d',
    calories: 120,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 200,
    tags: ['Local', 'Pure'],
    recommended: true,
  },
  {
    id: 'prod-4',
    name: 'Kyoto Matcha Reserve',
    price: 34.0,
    description: 'Shaded First Harvest',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmmRfnN9SR-x-_gblA5rIscykT7kLmI9nVKF12KubxhcTOHahkaVAMHoNh5eIJNL6asrOJSiVxxYBcRkYooafRpE1osk6InyRlZNFOxCeAfukMObbAMZH--yUi3ExdrI8-xzEUgbDQQyuYiq2LAxg3Hoqh3XEMNv0vdYxBXoVsHgtDarAjPK4SfvDI0AEd1_lOqSBfM0T1rFzIYSxR1vkcwPBs0J6tQhMk7c-TXMrTE1Hy_Frypqlq5NHW0eqFiaD48ABNyGdUvyra',
    calories: 5,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 50,
    tags: ['Japanese', 'Premium'],
    recommended: true,
  },
  {
    id: 'prod-5',
    name: 'Pure Stevia Leaves',
    price: 8.5,
    description: 'Sun-dried organic stevia',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg7eBQw3CinRkiGlp9Vmf8Sj8W6uRo6jkLhZ83iJYO48Ew7QVVIidIts2gs_G-t26kqP-Zh_XeFI9el4fLd17lRifqAJuTmogZmHRhCK9QqxFcywV26U-9VtLXdHhM0V8CDvfY4iMyDF4dsqTLOgrW_peZ2Y0TmUAvMo33phEhAA-Y46U2ttJJ_iNTvQpF_SBuJEXjbEyRy4PQbaINesMB6czopDy6zbqBHPXOt-QNx96JQuaZPKjWLxKlXAAfxxCpSAa2tzUG773d',
    calories: 0,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 100,
    tags: ['Natural', 'Sugar-Free'],
    recommended: false,
  },
  {
    id: 'prod-6',
    name: 'Hearth Sourdough loaf',
    price: 7.5,
    description: '36-hour Fermentation',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe',
    calories: 250,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 100,
    tags: ['Artisanal', 'Freshly Baked'],
    recommended: true,
  },
  {
    id: 'prod-7',
    name: 'Whole Milk',
    price: 24.0,
    description: 'Creamy dairy milk with a rich finish.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe',
    calories: 220,
    saleType: 'variable',
    unit: 'L',
    unit_weight: null,
    tags: ['Fresh', 'High Protein'],
    recommended: true,
  },
  {
    id: 'prod-8',
    name: 'Garden Roma Tomatoes',
    price: 4.25,
    description: 'Sweet, firm tomatoes for daily cooking.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe',
    calories: 18,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 500,
    tags: ['Fresh', 'Produce'],
    recommended: false,
  },
  {
    id: 'prod-9',
    name: 'Crisp Bell Peppers',
    price: 5.5,
    description: 'Mixed peppers for salads and stir fry.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe',
    calories: 30,
    saleType: 'fixed',
    unit: 'g',
    unit_weight: 300,
    tags: ['Fresh', 'Vegetables'],
    recommended: false,
  },
];

const initialState = {
  items: initialProducts.map(normalizeProduct),
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload.map(normalizeProduct);
    },
    addProduct: (state, action) => {
      state.items.push(normalizeProduct(action.payload));
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = normalizeSearchQuery(action.payload);
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
  },
});

export const { setProducts, addProduct, setSearchQuery, clearSearchQuery } = productsSlice.actions;
export default productsSlice.reducer;
