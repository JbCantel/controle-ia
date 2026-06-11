export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 ${className}`}>
      {children}
    </div>
  );
}
