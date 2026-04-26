import { useEffect, useState } from 'react';
import { fetchCategoryOptions } from '../adminData';
import { createProductWithCategories } from '../adminActions';
import AdminModal from './AdminModal';

const BASE_FORM = {
  id: '',
  name: '',
  description: '',
  image: '',
  price: '',
  calories: '',
  saleType: 'fixed',
  recommended: 'no',
  unit: 'g',
  unitWeight: '',
};

export default function AddProductModal({ onClose, onSaved }) {
  const [formValues, setFormValues] = useState(BASE_FORM);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingOptions(true);
        const categories = await fetchCategoryOptions();
        if (mounted) {
          setCategoryOptions(categories);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError?.response?.data?.message || loadError?.message || 'Failed to load categories');
        }
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setFormValues((prev) => {
      if (field === 'saleType' && value === 'variable') {
        return { ...prev, saleType: value, unitWeight: '' };
      }

      return { ...prev, [field]: value };
    });
  }

  function updateCategoryAt(index, value) {
    setSelectedCategoryIds((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  }

  function addCategoryRow() {
    setSelectedCategoryIds((prev) => {
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, ''];
    });
  }

  function removeCategoryRow(index) {
    setSelectedCategoryIds((prev) => {
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      await createProductWithCategories(formValues, selectedCategoryIds);

      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminModal title="Add Product" onClose={onClose} widthClass="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Product ID</span>
            <input
              type="text"
              value={formValues.id}
              onChange={(event) => updateField('id', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Name</span>
            <input
              type="text"
              value={formValues.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          <label className="text-sm text-on-surface-variant md:col-span-2">
            <span className="mb-1 block">Description</span>
            <textarea
              value={formValues.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="h-24 w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="text-sm text-on-surface-variant md:col-span-2">
            <span className="mb-1 block">Image URL</span>
            <input
              type="url"
              value={formValues.image}
              onChange={(event) => updateField('image', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Price (PKR)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Calories</span>
            <input
              type="number"
              min="0"
              step="1"
              value={formValues.calories}
              onChange={(event) => updateField('calories', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Sale Type</span>
            <select
              value={formValues.saleType}
              onChange={(event) => updateField('saleType', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            >
              <option value="fixed">fixed</option>
              <option value="variable">variable</option>
            </select>
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Recommended</span>
            <select
              value={formValues.recommended}
              onChange={(event) => updateField('recommended', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Unit</span>
            <select
              value={formValues.unit}
              onChange={(event) => updateField('unit', event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
            </select>
          </label>

          <label className="text-sm text-on-surface-variant">
            <span className="mb-1 block">Unit Weight (fixed only)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formValues.unitWeight}
              onChange={(event) => updateField('unitWeight', event.target.value)}
              disabled={formValues.saleType === 'variable'}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary disabled:opacity-60"
            />
          </label>
        </div>

        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Categories</h3>
            <button
              type="button"
              onClick={addCategoryRow}
              disabled={selectedCategoryIds.length >= 10 || loadingOptions}
              className="rounded-md border border-outline-variant/30 px-3 py-1 text-xs font-semibold text-on-surface-variant disabled:opacity-50"
            >
              + Add More
            </button>
          </div>

          <div className="space-y-2">
            {selectedCategoryIds.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No categories selected. This product will be created without categories.</p>
            ) : null}

            {selectedCategoryIds.map((categoryId, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={categoryId}
                  onChange={(event) => updateCategoryAt(index, event.target.value)}
                  className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
                  disabled={loadingOptions}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeCategoryRow(index)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant disabled:opacity-50"
                  aria-label="Remove category selector"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-on-surface-variant">Categories are optional. Maximum 10 categories per product.</p>
          {categoryOptions.length === 0 && !loadingOptions && selectedCategoryIds.length > 0 ? (
            <p className="mt-2 text-xs text-error">No categories found. Remove selectors or create a category first.</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || loadingOptions}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-70"
        >
          {submitting ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </AdminModal>
  );
}
