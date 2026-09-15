const VARIANTS = {
  primary: 'bg-brand font-semibold text-bg shadow-accent hover:bg-brand/90',
  secondary: 'border border-line text-ink hover:bg-line',
  danger: 'bg-expense font-semibold text-bg hover:bg-expense/90',
  ghost: 'text-ink-2 hover:bg-line hover:text-ink',
};

export default function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }) {
  const sizing = size === 'sm' ? 'h-9 px-3.5 text-[13px]' : 'h-11 px-5 text-[15px]';
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full transition-[background-color,color,border-color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${sizing} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-line hover:text-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
