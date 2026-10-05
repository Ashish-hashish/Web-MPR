import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { pickerIcon } from '../utils/leafletIcons';
import { Locate, Navigation, Crosshair, CheckCircle } from 'lucide-react';

// Sub-component to handle map clicks & center updates
const MapEventsHandler = ({ onLocationSelect, center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom() || 16, { animate: true, duration: 1.2 });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

const LocationPicker = ({
  latitude,
  longitude,
  onChange,
  onGpsDetect,
  gpsLoading,
  defaultCenter = { lat: 19.0760, lng: 72.8777 } // Default Mumbai BMC Coordinates
}) => {
  const currentLat = latitude ? parseFloat(latitude) : defaultCenter.lat;
  const currentLng = longitude ? parseFloat(longitude) : defaultCenter.lng;

  const markerPosition = useMemo(() => [currentLat, currentLng], [currentLat, currentLng]);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          Geotag Location Pin
        </label>
        
        {/* GPS Locate Button */}
        <button
          type="button"
          onClick={onGpsDetect}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Detecting GPS...' : 'Auto-Detect GPS'}
        </button>
      </div>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner h-[260px] sm:h-[300px]">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEventsHandler
            onLocationSelect={(lat, lng) => onChange(lat, lng)}
            center={{ lat: currentLat, lng: currentLng }}
          />

          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={markerPosition}
            ref={markerRef}
            icon={pickerIcon}
          />
        </MapContainer>

        {/* Floating instructions pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 backdrop-blur text-white text-[11px] px-3 py-1 rounded-full shadow pointer-events-none flex items-center gap-1.5 border border-slate-700/50">
          <Locate className="w-3 h-3 text-blue-400" />
          Click or drag pin to fine-tune exact spot
        </div>
      </div>

      {/* Coordinates pill */}
      <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200/80 text-slate-600 font-mono">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 font-sans" />
          <span>Coordinates:</span>
        </span>
        <span className="font-semibold text-slate-800">
          {currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E
        </span>
      </div>
    </div>
  );
};

export default LocationPicker;
