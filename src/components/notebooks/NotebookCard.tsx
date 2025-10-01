import React from 'react';
import type { Notebook } from '../../types/entities';
import { Link } from 'react-router-dom';

const NotebookCard: React.FC<{ notebook: Notebook }> = ({ notebook }) => {
  const count = (notebook as any).items ? (notebook as any).items.length : notebook.vocab_count;

  return (
    <Link to={`/notebooks/${notebook.id}`} className="block bg-white p-4 rounded-lg shadow hover:shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg truncate">{notebook.name}</h4>
        {notebook.is_premium && <span className="text-sm text-orange-600 font-medium">Premium</span>}
      </div>
      <p className="text-sm text-gray-500 mt-2">{count} từ</p>
    </Link>
  );
};

export default NotebookCard;
