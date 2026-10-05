import React, { useState, useEffect, useCallback } from 'react';
import { grievanceService } from '../services/api';
import MapView from '../components/MapView';
import {
  HardHat,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Search,
  RefreshCw,
  MapPin,
  ListFilter,
  ChevronRight,
  TrendingUp,
  Image
} from 'lucide-react';

const WorkerDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentBounds, setCurrentBounds] = useState(null);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [activeTab, setActiveTab] = useState('split'); // 'split', 'map', 'list'

  // Fetch summary stats
  const fetchStats = async () => {
    try {
      const res = await grievanceService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Fetch grievances within current map bounding box and filters
  const fetchGrievances = useCallback(async (bounds = currentBounds) => {
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
      console.error('Failed to fetch map grievances:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBounds, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchStats();
    fetchGrievances();
  }, [statusFilter, categoryFilter]);

  const handleBoundsChange = (bounds) => {
    setCurrentBounds(bounds);
    fetchGrievances(bounds);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await grievanceService.updateStatus(id, newStatus);
      if (res.success) {
        // Update local list
        setGrievances((prev) =>
          prev.map((item) => (item._id === id ? res.data : item))
        );
        // Refresh stats
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <HardHat className="w-4 h-4" />
            BMC Field Operations Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Worker Triage & Map Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Real-time viewport inspection, issue geotag verification, and resolution workflow.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchGrievances();
          }}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Viewport
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Pending Action</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.inProgress}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Filter className="w-4 h-4 text-slate-600" />
            Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">🔴 Pending Only</option>
            <option value="IN_PROGRESS">🟡 In Progress</option>
            <option value="RESOLVED">🟢 Resolved</option>
          </select>

          {/* Category Filter */}
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
          Showing <span className="font-bold text-slate-800">{grievances.length}</span> visible issues in current viewport
        </div>
      </div>

      {/* Main Split Layout: Map + Issue List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map View Area (7 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <MapView
            grievances={grievances}
            onBoundsChange={handleBoundsChange}
            onStatusUpdate={handleStatusUpdate}
            isWorker={true}
            selectedGrievance={selectedGrievance}
            height="620px"
          />
        </div>

        {/* Issue Feed Sidebar (5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-lg p-4 flex flex-col h-[620px]">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-blue-600" />
              Viewport Grievance Queue
            </h3>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {grievances.length}
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 pr-1 space-y-2">
            {grievances.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium">No grievances in this map area</p>
                <p className="text-[11px] text-slate-400">Pan or zoom out the map to load more</p>
              </div>
            ) : (
              grievances.map((item) => {
                const isSelected = selectedGrievance?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedGrievance(item)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                        : 'bg-slate-50/50 hover:bg-slate-100/80 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-700 shadow-xs border border-slate-200/60">
                        {item.category?.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'PENDING'
                            ? 'bg-rose-100 text-rose-700'
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                        Focus Pin <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
