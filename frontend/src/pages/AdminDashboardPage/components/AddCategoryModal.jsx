import { useState } from 'react';
import AdminModal from './AdminModal';
import { createCategory } from '../adminActions';

export default function AddCategoryModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await createCategory(name);
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminModal title="Add Category" onClose={onClose} widthClass="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-on-surface-variant">
          <span className="mb-1 block">Category Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            maxLength={20}
            required
          />
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-70"
        >
          {submitting ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </AdminModal>
  );
}
