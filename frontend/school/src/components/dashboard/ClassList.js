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
