import React, { useState, useEffect } from 'react';
import { grievanceService } from '../services/api';
import MapView from '../components/MapView';
import { Map, Filter, RefreshCw } from 'lucide-react';

const PublicMap = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentBounds, setCurrentBounds] = useState(null);

  const fetchGrievances = async (bounds = currentBounds) => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter,
        category: categoryFilter,
      };

      if (bounds) {
        params.swLat = bounds.swLat;
        params.swLng = bounds.swLng;
        params.neLat = bounds.neLat;
        params.neLng = bounds.neLng;
      }

      const res = await grievanceService.getMapView(params);
      if (res.success) {
        setGrievances(res.data);
      }
    } catch (err) {
      console.error('Failed to load public map grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [statusFilter, categoryFilter]);

  const handleBoundsChange = (bounds) => {
    setCurrentBounds(bounds);
    fetchGrievances(bounds);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-7 h-7 text-blue-600" />
            Live Civic Issues Map
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Explore active civic grievances reported by citizens across the city.
          </p>
        </div>

        <button
          onClick={() => fetchGrievances()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh View
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">🔴 Pending</option>
            <option value="IN_PROGRESS">🟡 In Progress</option>
            <option value="RESOLVED">🟢 Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="burst_pipe">Burst Pipes</option>
            <option value="hanging_wire">Hanging Wires</option>
            <option value="garbage">Garbage Dumps</option>
            <option value="other">Other Issues</option>
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Viewing <span className="font-bold text-slate-800">{grievances.length}</span> issues
        </div>
      </div>

      {/* Map */}
      <MapView
        grievances={grievances}
        onBoundsChange={handleBoundsChange}
        isWorker={false}
        height="650px"
      />
    </div>
  );
};

export default PublicMap;
