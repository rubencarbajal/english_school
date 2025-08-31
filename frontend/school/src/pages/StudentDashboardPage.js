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
