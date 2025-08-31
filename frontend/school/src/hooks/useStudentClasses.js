// src/hooks/useStudentClasses.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE = '/api';

export default function useStudentClasses() {
  const { token, user } = useAuth(); // adapt to your AuthContext (token or getToken)
  const [filters, setFilters] = useState({ status: 'upcoming', q: '' }); // 'upcoming' | 'completed' | 'all'
  const [classes, setClasses] = useState([]);
  const [counts, setCounts] = useState({ upcoming: 0, completed: 0, all: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.q) params.set('q', filters.q);
      const res = await fetch(`${API_BASE}/students/me/classes?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClasses(data.items || []);
      setCounts({
        upcoming: data.counts?.upcoming ?? 0,
        completed: data.counts?.completed ?? 0,
        all: data.counts?.all ?? (data.total ?? (data.items?.length ?? 0)),
      });
    } catch (e) {
      setError('No se pudieron cargar tus clases. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters, authHeader]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const refresh = useCallback(() => fetchClasses(), [fetchClasses]);

  const markTaken = useCallback(async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ taken: true }),
      });
      if (!res.ok) throw new Error('attendance failed');
      await fetchClasses();
    } catch {
      setError('No se pudo marcar como tomada.');
    }
  }, [authHeader, fetchClasses]);

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error('cancel failed');
      await fetchClasses();
    } catch {
      setError('No se pudo cancelar la clase.');
    }
  }, [authHeader, fetchClasses]);

  return { filters, setFilters, classes, counts, loading, error, refresh, markTaken, cancelBooking };
}
