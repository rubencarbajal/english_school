Awesome—now that your “forgot password” is fixed, here’s a clean, repeatable way to add **new pages**. We’ll use it to add a **Student Dashboard** (shows booked classes and which ones are already taken) while keeping your current `setPage` navigation and Tailwind look.

---

# 0) High-level flow

* **App.js**: add a new page key: `'studentDashboard'`
* **Header**: add a “Dashboard” nav (only when logged in)
* **pages/**: create `StudentDashboardPage.js`
* **components/dashboard/**: add small, reusable bits (filters, list, card)
* **hooks/**: create `useStudentClasses.js` (fetches bookings/classes)
* **constants/**: add `classStatus.js`
* **Backend endpoints**: define GET/PATCH/DELETE you’ll implement later

---

# 1) App.js — add the page

```diff
// App.js
import BookingPage from './pages/BookingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
+import StudentDashboardPage from './pages/StudentDashboardPage';
+import Header from './components/layout/Header';
+import Footer from './components/layout/Footer';

function App() {
  const [page, setPage] = useState('booking'); // or 'studentDashboard' after login

  const renderPage = () => {
    switch (page) {
      case 'forgotPassword':
        return <ForgotPasswordPage setPage={setPage} />;
      case 'resetPassword':
        return <ResetPasswordPage setPage={setPage} />;
+     case 'studentDashboard':
+       return <StudentDashboardPage setPage={setPage} />;
      case 'booking':
      default:
        return <BookingPage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
-     <Header />
+     <Header setPage={setPage} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}
```

---

# 2) Header.js — add Dashboard link (only if logged)

```diff
// src/components/layout/Header.js
import { useAuth } from '../../hooks/useAuth';

- const Header = () => {
+ const Header = ({ setPage }) => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">YourApp</div>
        <nav className="flex items-center gap-4">
          <button className="text-sm hover:underline" onClick={() => setPage('booking')}>Book</button>
+         {isAuthenticated && (
+           <button className="text-sm hover:underline" onClick={() => setPage('studentDashboard')}>
+             Dashboard
+           </button>
+         )}
        </nav>
      </div>
    </header>
  );
}
```

---

# 3) New page: `pages/StudentDashboardPage.js`

```jsx
// src/pages/StudentDashboardPage.js
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import useStudentClasses from '../hooks/useStudentClasses';
import ClassFilters from '../components/dashboard/ClassFilters';
import ClassList from '../components/dashboard/ClassList';
import EmptyState from '../components/dashboard/EmptyState';

const StudentDashboardPage = ({ setPage }) => {
  const { isAuthenticated } = useAuth();
  const { filters, setFilters, classes, loading, error, refresh, markTaken, cancelBooking, counts } =
    useStudentClasses();

  useEffect(() => {
    if (!isAuthenticated) setPage('booking'); // or 'login' if you have that page
  }, [isAuthenticated, setPage]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mis clases</h1>
        <p className="text-sm text-gray-500">Revisa tus clases reservadas y su estado.</p>
      </div>

      <ClassFilters filters={filters} setFilters={setFilters} counts={counts} onRefresh={refresh} />

      {loading ? (
        <div className="mt-6 animate-pulse h-24 bg-gray-200 rounded-xl" />
      ) : error ? (
        <div className="mt-6 text-red-600 text-sm">{error}</div>
      ) : classes.length === 0 ? (
        <EmptyState onBook={() => setPage('booking')} />
      ) : (
        <ClassList
          classes={classes}
          onMarkTaken={markTaken}
          onCancel={cancelBooking}
        />
      )}
    </div>
  );
};

export default StudentDashboardPage;
```

---

# 4) New hook: `hooks/useStudentClasses.js`

```jsx
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
```

---

# 5) Dashboard components

Create a new folder: `src/components/dashboard/`

### `ClassFilters.js`

```jsx
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
```

### `ClassList.js`

```jsx
// src/components/dashboard/ClassList.js
import ClassCard from './ClassCard';

export default function ClassList({ classes, onMarkTaken, onCancel }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {classes.map(cls => (
        <ClassCard
          key={cls.bookingId}
          cls={cls}
          onMarkTaken={() => onMarkTaken(cls.bookingId)}
          onCancel={() => onCancel(cls.bookingId)}
        />
      ))}
    </div>
  );
}
```

### `ClassCard.js`

```jsx
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
```

### `EmptyState.js`

```jsx
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
```

### Shared badge (reuse Tailwind): `components/shared/StatusBadge.js`

```jsx
// src/components/shared/StatusBadge.js
export default function StatusBadge({ status, attended }) {
  let text = 'Próxima', cls = 'bg-blue-100 text-blue-700';
  if (status === 'completed') {
    text = attended ? 'Completada (asistida)' : 'Completada';
    cls = attended ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700';
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>;
}
```

---

# 6) Constants

`src/constants/classStatus.js`

```js
export const CLASS_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  ALL: 'all',
};
```

(Use it across the page/components if you prefer enums.)

---

# 7) Backend endpoints (to implement later)

Design them so the UI above works out of the box:

### 1) List the student’s classes

```
GET /api/students/me/classes?status=upcoming|completed|all&q=&page=1&limit=20&from=&to=
Authorization: Bearer <token>
```

**Response**

```json
{
  "items": [
    {
      "bookingId": "b_123",
      "classId": "c_987",
      "title": "Inglés B1 - Sesión 4",
      "startAt": "2025-09-03T15:00:00Z",
      "endAt": "2025-09-03T16:00:00Z",
      "location": "Aula 203",
      "instructor": { "id": "t_55", "name": "Prof. Smith" },
      "status": "upcoming",   // or "completed"
      "attended": false       // true if marked taken/attended
    }
  ],
  "counts": { "upcoming": 5, "completed": 12, "all": 17 },
  "total": 17,
  "page": 1,
  "limit": 20
}
```

* `status` filter:

  * `upcoming`: classes with `startAt` >= now and not canceled.
  * `completed`: classes with `endAt` < now (regardless of attendance).
  * `all`: both.
* `attended` is set from attendance/consumption in your DB.

### 2) Mark a booking as taken

```
PATCH /api/bookings/:bookingId/attendance
Authorization: Bearer <token>
Content-Type: application/json

{ "taken": true }   // or false to undo
```

**Response**: `200 OK { "bookingId": "...", "attended": true }`

### 3) Cancel a booking

```
DELETE /api/bookings/:bookingId
Authorization: Bearer <token>
```

**Response**: `204 No Content`

> (Optional) Add `GET /api/bookings/stats` for quick counters, but the list endpoint above already returns `counts` to populate tabs.

**DB sketch**

* `Booking { _id, studentId, classId, createdAt, canceledAt, attendedAt }`
* `Class { _id, title, startAt, endAt, location, instructorId }`
* Derive:

  * `status`: `upcoming` if `now < endAt` and not canceled; else `completed`.
  * `attended`: `Boolean(attendedAt)`.

---

# 8) Keep it consistent with your current styles

* Cards: rounded-2xl, subtle border, `shadow-sm`, white background.
* Controls: `rounded-xl`, small paddings, hover states.
* Layout: `max-w-6xl`, `px-4`, `py-6`, responsive grid for the list.

---

# 9) Optional (future): switch to React Router

This would replace `setPage` with routes:

* `/booking`, `/dashboard`, `/forgot-password`, `/reset-password/:token`
  It scales better, but you can adopt it later.

---

# 10) Quick test checklist

* [ ] Header “Dashboard” shows only when logged in; click → loads classes.
* [ ] Tabs filter results and counters update.
* [ ] Search (`q`) filters.
* [ ] “Marcar como tomada” calls PATCH and refreshes list.
* [ ] “Cancelar” calls DELETE and refreshes.
* [ ] Empty state shows when no data.
* [ ] Auth required (redirect to booking/login if not authenticated).

---

If you want, I can adapt the hook to your exact `useAuth` shape (e.g., if your token retrieval is different) or wire these components to your existing Tailwind palette/utilities.
