// src/components/dashboard/EmptyState.js
export default function EmptyState({ onBook }) {
  return (
    <div className="mt-10 rounded-2xl border bg-white p-8 text-center">
      <h3 className="text-lg font-semibold">No tienes clases en esta vista</h3>
      <p className="mt-1 text-sm text-gray-500">Reserva tu próxima clase para verla aquí.</p>
      <button onClick={onBook} className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-white hover:opacity-90">
        Reservar ahora
      </button>
    </div>
  );
}
