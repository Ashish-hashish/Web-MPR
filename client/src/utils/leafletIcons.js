import L from 'leaflet';
import { getPhotoUrl } from '../services/api';

export { getPhotoUrl };

// Fix for default Leaflet icon paths in bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category Icons Mapping (SVG paths)
export const getCategoryIconSvg = (category) => {
  switch (category) {
    case 'pothole':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`;
    case 'burst_pipe':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m4.93 10.93 4.24 4.24"/><path d="M2 18h20"/><path d="M12 18v4"/><path d="M12 8a6 6 0 0 0-6 6"/><path d="M18 14a6 6 0 0 0-6-6"/></svg>`;
    case 'hanging_wire':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    case 'garbage':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
  }
};

// Custom Status Markers with Colors:
// Red = PENDING, Yellow/Amber = IN_PROGRESS, Green = RESOLVED
export const createGrievanceIcon = (status, category) => {
  let bgColor = '#ef4444'; // Red for PENDING
  let ringColor = 'ring-red-400';
  let pulseClass = status === 'PENDING' ? 'pulse' : '';

  if (status === 'IN_PROGRESS') {
    bgColor = '#f59e0b'; // Amber / Yellow for IN_PROGRESS
    ringColor = 'ring-amber-400';
  } else if (status === 'RESOLVED') {
    bgColor = '#10b981'; // Green for RESOLVED
    ringColor = 'ring-emerald-400';
  }

  const iconSvg = getCategoryIconSvg(category);

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="custom-pin ${pulseClass}" style="background-color: ${bgColor}; width: 34px; height: 34px; border: 2.5px solid white;">
        ${iconSvg}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

// Draggable Picker Marker Icon
export const pickerIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `
    <div style="
      background-color: #2563eb;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #ffffff;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});
