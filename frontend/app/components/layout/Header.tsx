export function Header() {
  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50 w-full">
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20">
        <div className="text-headline-sm font-headline-sm font-semibold tracking-tighter text-primary">
          MODA SENSE
        </div>
        <div className="hidden md:flex items-center space-x-10">
          <a
            className="text-primary border-b-2 border-primary pb-1 text-label-sm font-label-sm transition-opacity opacity-70"
            href="#"
          >
            Analyze
          </a>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Account"
          >
            <span className="material-symbols-outlined text-primary">
              account_circle
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
