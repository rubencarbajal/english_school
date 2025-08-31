// src/components/dashboard/ClassFilters.js
const tabs = [
  { key: 'upcoming', label: 'Próximas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'all', label: 'Todas' },
];

export default function ClassFilters({ filters, setFilters, counts, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-xl border bg-white p-1">
        {tabs.map(t => {
          const active = filters.status === t.key;
          const count =
            t.key === 'upcoming' ? counts.upcoming :
            t.key === 'completed' ? counts.completed : counts.all;
          return (
            <button
              key={t.key}
              onClick={() => setFilters(f => ({ ...f, status: t.key }))}
              className={`px-3 py-1.5 text-sm rounded-lg ${active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {t.label}{typeof count === 'number' ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filters.q}
          onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          placeholder="Buscar clase, instructor…"
          className="h-9 rounded-xl border px-3 text-sm"
        />
        <button onClick={onRefresh} className="h-9 rounded-xl border px-3 text-sm bg-white hover:bg-gray-50">
          Actualizar
        </button>
      </div>
    </div>
  );
}
