import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWaiting } from '../../context/WaitingContext';
import OfficeList from './OfficeList';
import WaitingTracker from './WaitingTracker';
import WaitingHistory from './WaitingHistory';

const WaitingDashboard = () => {
  const { user } = useAuth();
  const { activeSession, isTracking, checkActiveSession } = useWaiting();
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [activeTab, setActiveTab] = useState('offices');

  useEffect(() => {
    checkActiveSession();
  }, []);

  const handleSelectOffice = (office) => {
    setSelectedOffice(office);
    setActiveTab('tracker');
  };

  const handleWaitingEnd = () => {
    setSelectedOffice(null);
    setActiveTab('history');
  };

  if (isTracking || activeSession) {
    return (
      <div className="max-w-2xl mx-auto">
        <WaitingTracker 
          office={activeSession?.office || selectedOffice} 
          onEnd={handleWaitingEnd}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Track your waiting time at offices. Your data helps improve policy making.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('offices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Find Offices
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My History
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'offices' ? (
          <OfficeList onSelectOffice={handleSelectOffice} />
        ) : (
          <WaitingHistory />
        )}
      </div>
    </div>
  );
};

export default WaitingDashboard;
