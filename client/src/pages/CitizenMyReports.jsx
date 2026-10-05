import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grievanceService, getPhotoUrl } from '../services/api';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FilePlus2,
  Calendar,
  MapPin,
  HardHat,
  Loader2,
  ExternalLink,
  Search
} from 'lucide-react';

const CitizenMyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await grievanceService.getMyGrievances();
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load your submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const filteredReports = reports.filter((r) =>
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            PENDING TRIAGE
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            WORK IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RESOLVED & CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Submitted Grievances
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track real-time progress and resolution status of issues you reported.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <FilePlus2 className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Search Filter */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-semibold">Loading your civic records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Grievances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You haven't submitted any civic grievances matching your criteria yet.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
          >
            <FilePlus2 className="w-4 h-4" /> Report an Issue Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((item) => {
            const photoSrc = getPhotoUrl(item.photoUrl);
            const [lng, lat] = item.location?.coordinates || [0, 0];

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={photoSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-white shadow">
                        {item.category?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div>
                      {getStatusBadge(item.status)}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.assignedWorker ? (
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2 text-xs">
                        <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Assigned Worker: <strong>{item.assignedWorker.name}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-500 text-[11px] text-center">
                        Awaiting BMC field worker assignment
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CitizenMyReports;
