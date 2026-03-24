import React, { useState } from 'react';
import { useWaiting } from '../../context/WaitingContext';
import { toast } from 'react-toastify';

const WaitingTracker = ({ office, onEnd }) => {
  const { elapsedTime, endWaiting, loading } = useWaiting();
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleEndWaiting = async () => {
    if (!office?._id) return;
    
    setShowFeedback(true);
  };

  const submitFeedback = async () => {
    const result = await endWaiting(office._id, rating, comment);
    if (result.success) {
      setShowFeedback(false);
      onEnd();
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Currently Waiting at {office?.name}
        </h3>
        
        <div className="mb-4">
          <p className="text-4xl font-bold text-blue-600">
            {formatTime(elapsedTime)}
          </p>
          <p className="text-gray-500">Waiting Time</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Office Type:</span> {office?.type}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Address:</span> {office?.address?.street}, {office?.address?.city}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Working Hours:</span> {office?.workingHours?.start} - {office?.workingHours?.end}
          </p>
        </div>

        <button
          onClick={handleEndWaiting}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Ending...' : 'End Waiting'}
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">How was your experience?</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full border rounded-md p-2"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitFeedback}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingTracker;
