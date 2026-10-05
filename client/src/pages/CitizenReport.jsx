import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { grievanceService } from '../services/api';
import LocationPicker from '../components/LocationPicker';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FilePlus,
  Send,
  Loader2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { value: 'pothole', label: 'Pothole / Road Damage', description: 'Craters, uneven road surface, sinkholes' },
  { value: 'burst_pipe', label: 'Burst Pipe / Water Leak', description: 'Pipeline rupture, water wastage, flooding' },
  { value: 'hanging_wire', label: 'Hanging Wire / Electric Hazard', description: 'Loose electrical cables, fallen power lines' },
  { value: 'garbage', label: 'Garbage Dump / Sanitation', description: 'Uncollected trash, clogged drains, open dumps' },
  { value: 'other', label: 'Other Civic Issue', description: 'Broken streetlights, damaged public property, etc.' }
];

const CitizenReport = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(19.0760); // Default Mumbai Lat
  const [longitude, setLongitude] = useState(72.8777); // Default Mumbai Lng

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-detect GPS on component mount
  useEffect(() => {
    detectGpsLocation();
  }, []);

  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus('Detecting precise GPS coordinates...');
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
        setGpsStatus('GPS Lock acquired successfully!');
        setTimeout(() => setGpsStatus(''), 4000);
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        setGpsLoading(false);
        setGpsStatus('Could not get automatic GPS. Please drag or click pin on map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide a short title for the issue');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the issue in detail');
      return;
    }
    if (!photo) {
      setError('Please attach or capture a photo of the grievance');
      return;
    }
    if (!latitude || !longitude) {
      setError('Location coordinates are required. Please pinpoint on map.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('photo', photo);

      const res = await grievanceService.createGrievance(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-reports');
        }, 2000);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Title & Introduction */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Civic Grievance Geotagger
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Report a Municipal Issue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Geotag civic defects like potholes, burst pipes, and hanging wires for immediate BMC action.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Grievance Filed Successfully!</h4>
            <p className="text-xs text-emerald-700">Redirecting to your submissions tracker...</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Main Report Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Issue Title / Short Summary *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole near Andheri East station entry"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
            />
          </div>

          {/* Issue Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Defect Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                    category === cat.value
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-1 flex items-center justify-between">
                    <span>{cat.label}</span>
                    {category === cat.value && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {cat.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Capture / Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Photo Proof (Camera or File) *
            </label>

            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50 hover:bg-blue-50/30 cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-white group-hover:bg-blue-100 rounded-full shadow-sm text-slate-600 group-hover:text-blue-600 transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      Take Photo or Upload Image
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supports mobile camera live capture (`capture="environment"`)
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP up to 10MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
                <img
                  src={photoPreview}
                  alt="Proof preview"
                  className="w-full max-h-64 object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-lg hover:bg-rose-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-lg text-white text-xs">
                  {photo?.name} ({(photo?.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmarks, severity, how long it has persisted, and any safety hazards..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
            ></textarea>
          </div>

          {/* Geotag Map Picker */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                5. Geotag Location Verification *
              </label>
              {gpsStatus && (
                <span className="text-xs font-semibold text-blue-600 animate-pulse">
                  {gpsStatus}
                </span>
              )}
            </div>

            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              onGpsDetect={detectGpsLocation}
              gpsLoading={gpsLoading}
            />
          </div>

          {/* Form Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading Geotagged Grievance...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Grievance to BMC
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CitizenReport;
