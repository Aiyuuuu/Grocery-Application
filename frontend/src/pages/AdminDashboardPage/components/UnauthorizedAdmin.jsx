export default function UnauthorizedAdmin() {
  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-error/30 bg-error/10 p-8 text-center shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.2em] text-error">Access Denied</p>
        <h1 className="mt-3 font-headline text-3xl font-bold text-on-surface">Unauthorized</h1>
        <p className="mt-3 text-on-surface-variant">
          This page is only available for admin users.
        </p>
      </section>
    </main>
  );
}
