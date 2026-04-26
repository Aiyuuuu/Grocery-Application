import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { upgradeToAdmin } from '../../store/AuthPage/authSlice';

export default function AdminAccessPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      await dispatch(upgradeToAdmin(adminPassword)).unwrap();
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(String(requestError || 'Failed to upgrade role'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Admin Access</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-outline-variant/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-on-surface-variant">
            <span className="mb-1 block">Admin Password</span>
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              className="w-full rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              required
            />
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-70"
          >
            {submitting ? 'Verifying...' : 'Continue to Admin Panel'}
          </button>
        </form>
      </section>
    </main>
  );
}
