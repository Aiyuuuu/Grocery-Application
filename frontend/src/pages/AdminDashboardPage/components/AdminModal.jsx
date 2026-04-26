export default function AdminModal({ title, onClose, children, widthClass = 'max-w-6xl' }) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className={`w-full ${widthClass} max-h-[92vh] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container shadow-[0_36px_64px_rgba(0,0,0,0.55)]`}>
        <header className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h2 className="font-headline text-xl font-bold text-on-surface">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <div className="max-h-[calc(92vh-72px)] overflow-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
