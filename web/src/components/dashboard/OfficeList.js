import React, { useState, useEffect } from 'react';
import { officeAPI } from '../../services/api';
import { toast } from 'react-toastify';

const OfficeList = ({ onSelectOffice }) => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    city: ''
  });

  useEffect(() => {
    loadOffices();
  }, [filters]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const response = await officeAPI.getOffices(filters);
      setOffices(response.data.data);
    } catch (error) {
      toast.error('Failed to load offices');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      government: 'bg-blue-100 text-blue-800',
      private: 'bg-green-100 text-green-800',
      bank: 'bg-yellow-100 text-yellow-800',
      hospital: 'bg-red-100 text-red-800',
      school: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Types</option>
          <option value="government">Government</option>
          <option value="private">Private</option>
          <option value="bank">Bank</option>
          <option value="hospital">Hospital</option>
          <option value="school">School</option>
        </select>
        
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="px-3 py-2 border rounded-md flex-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offices.map((office) => (
          <div
            key={office._id}
            className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
            onClick={() => onSelectOffice(office)}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{office.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(office.type)}`}>
                {office.type}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{office.address?.street}</p>
            <p className="text-gray-600 text-sm">
              {office.address?.city}, {office.address?.state}
            </p>
            <div className="mt-3 text-sm text-gray-500">
              Hours: {office.workingHours?.start} - {office.workingHours?.end}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectOffice(office);
              }}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Start Waiting
            </button>
          </div>
        ))}
      </div>

      {offices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No offices found in this area
        </div>
      )}
    </div>
  );
};

export default OfficeList;
