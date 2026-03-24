import React, { useState, useEffect } from 'react';
import { useWaiting } from '../../context/WaitingContext';

const WaitingHistory = () => {
  const { history, loadHistory, loading } = useWaiting();
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.completed;
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Waiting History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.data?.map((session) => (
              <tr key={session._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{session.office?.name}</div>
                  <div className="text-xs text-gray-500">{session.office?.type}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(session.startTime)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {session.waitingDuration} minutes
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {session.feedback?.rating ? (
                    <div className="flex">
                      {[...Array(session.feedback.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No rating</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">Page {page} of {history.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(history.totalPages, p + 1))}
            disabled={page === history.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingHistory;
