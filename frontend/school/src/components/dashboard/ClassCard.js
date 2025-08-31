// src/components/dashboard/ClassCard.js
import StatusBadge from '../shared/StatusBadge';

export default function ClassCard({ cls, onMarkTaken, onCancel }) {
  const { title, startAt, endAt, instructor, location, status, attended } = cls;
  const start = new Date(startAt).toLocaleString();
  const end = new Date(endAt).toLocaleString();

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-gray-500">{instructor?.name}</p>
        </div>
        <StatusBadge status={status} attended={attended} />
      </div>

      <div className="mt-3 text-sm text-gray-700">
        <div>{start} – {end}</div>
        {location && <div className="text-gray-500">{location}</div>}
      </div>

      <div className="mt-4 flex gap-2">
        {status === 'upcoming' && (
          <>
            <button onClick={onCancel} className="text-sm rounded-xl border px-3 py-1.5 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={onMarkTaken} className="text-sm rounded-xl bg-gray-900 px-3 py-1.5 text-white hover:opacity-90">
              Marcar como tomada
            </button>
          </>
        )}
        {status !== 'upcoming' && attended && (
          <span className="text-xs text-gray-500">Asististe</span>
        )}
      </div>
    </div>
  );
}
