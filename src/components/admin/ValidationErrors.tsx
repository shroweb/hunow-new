export function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="mb-5 border-2 border-red-600 bg-red-50 p-4">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-700">
        Fix before saving
      </div>
      <ul className="list-disc pl-5 text-sm text-red-800">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
