export function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
        <div className="mb-stack-md md:mb-0">
          <span className="text-headline-sm font-headline-sm text-primary">
            MODA SENSE
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-4">
          <div className="flex space-x-8">
            {["Privacy", "Terms", "Editorial Policy", "Support"].map((item) => (
              <a
                key={item}
                className="text-on-surface-variant text-label-sm font-label-sm hover:text-primary transition-colors"
                href="#"
              >
                {item}
              </a>
            ))}
          </div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            © 2024 MODA SENSE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
