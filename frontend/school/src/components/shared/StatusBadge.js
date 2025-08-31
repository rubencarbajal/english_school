// src/components/shared/StatusBadge.js
export default function StatusBadge({ status, attended }) {
  let text = 'Próxima', cls = 'bg-blue-100 text-blue-700';
  if (status === 'completed') {
    text = attended ? 'Completada (asistida)' : 'Completada';
    cls = attended ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700';
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>;
}
