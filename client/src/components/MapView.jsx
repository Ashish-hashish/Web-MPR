import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { createGrievanceIcon } from '../utils/leafletIcons';
import { getPhotoUrl } from '../services/api';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  HardHat,
  Calendar,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Bounding box event listener & map controller
const MapViewportWatcher = ({ onBoundsChange, center, selectedGrievance }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedGrievance && selectedGrievance.location?.coordinates) {
      const [lng, lat] = selectedGrievance.location.coordinates;
      map.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
    }
  }, [selectedGrievance, map]);

  const updateBounds = () => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    onBoundsChange({
      swLat: sw.lat,
      swLng: sw.lng,
      neLat: ne.lat,
      neLng: ne.lng,
    });
  };

  useMapEvents({
    load: () => updateBounds(),
    moveend: () => updateBounds(),
    zoomend: () => updateBounds(),
  });

  return null;
};

const MapView = ({
  grievances = [],
  onBoundsChange = () => {},
  onStatusUpdate = null,
  isWorker = false,
  selectedGrievance = null,
  center = [19.0760, 72.8777], // Mumbai default
  zoom = 13,
  height = '600px'
}) => {
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    if (!onStatusUpdate) return;
    setUpdatingId(id);
    try {
      await onStatusUpdate(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCategory = (cat) => {
    return cat ? cat.replace(/_/g, ' ').toUpperCase() : 'GENERAL';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            PENDING
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            RESOLVED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewportWatcher
          onBoundsChange={onBoundsChange}
          selectedGrievance={selectedGrievance}
        />

        {grievances.map((item) => {
          if (!item.location || !item.location.coordinates) return null;
          // CRITICAL: MongoDB GeoJSON coordinates are [longitude, latitude]
          const [lng, lat] = item.location.coordinates;
          const photoSrc = getPhotoUrl(item.photoUrl);

          return (
            <Marker
              key={item._id}
              position={[lat, lng]}
              icon={createGrievanceIcon(item.status, item.category)}
            >
              <Popup className="custom-popup" maxWidth={320} minWidth={280}>
                <div className="bg-white rounded-xl overflow-hidden font-sans">
                  {/* Photo Banner with Click to Enlarge */}
                  <div
                    className="relative h-36 bg-slate-900 group cursor-pointer overflow-hidden"
                    onClick={() => setActivePhotoModal(photoSrc)}
                  >
                    <img
                      src={photoSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 flex items-end justify-between p-2.5">
                      <span className="text-[10px] font-bold bg-white/90 backdrop-blur text-slate-800 px-2 py-0.5 rounded shadow">
                        {formatCategory(item.category)}
                      </span>
                      <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur">
                        <Maximize2 className="w-2.5 h-2.5" /> Enlarge
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                        {item.title}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {item.reportedBy?.name || 'Citizen'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {item.assignedWorker && (
                        <div className="flex items-center gap-1 text-amber-700 font-medium">
                          <HardHat className="w-3 h-3" />
                          <span>Worker: {item.assignedWorker.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Worker Action Controls */}
                    {isWorker && onStatusUpdate && (
                      <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Update Work Status:
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {item.status !== 'IN_PROGRESS' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'IN_PROGRESS')}
                              className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <Clock className="w-3 h-3" />
                              In Progress
                            </button>
                          )}

                          {item.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'RESOLVED')}
                              className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Fixed
                            </button>
                          )}

                          {item.status === 'RESOLVED' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'PENDING')}
                              className="col-span-2 py-1.5 px-2 bg-slate-100 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Reopen Issue
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200 text-xs font-medium space-y-1.5 pointer-events-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
          Status Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></span>
          <span className="text-slate-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
          <span className="text-slate-700">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
          <span className="text-slate-700">Resolved</span>
        </div>
      </div>

      {/* Full Photo Modal Preview */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 z-10 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal}
              alt="Grievance Full View"
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
