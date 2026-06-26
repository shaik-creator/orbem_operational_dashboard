export default function LoadingState({ rows = 5, message = '' }) {
  return (
    <div className="space-y-3 orbem-fade-in">
      {message ? (
        <div className="flex items-center gap-2 px-1 py-1 text-sm text-[#64748b]">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#dbe3ea] border-t-[#1d9e75]" />
          {message}
        </div>
      ) : null}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-14 rounded-xl overflow-hidden relative bg-gray-100"
          style={{ opacity: 1 - index * 0.07 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
            style={{ backgroundSize: '200% 100%', animation: `shimmer 1.5s infinite linear ${index * 0.1}s` }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
