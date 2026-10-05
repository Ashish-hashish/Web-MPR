import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  FilePlus2,
  ListTodo,
  Map,
  HardHat,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isWorker, isCitizen, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={isWorker ? '/worker-dashboard' : '/report'}
            className="flex items-center space-x-3 group"
          >
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Civic<span className="text-blue-400">Eye</span>
                <span className="text-[10px] bg-blue-900/80 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-700">BMC</span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Municipal Grievance Geotagger</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {isWorker && (
                  <Link
                    to="/worker-dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/worker-dashboard')
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-amber-400" />
                    Worker Dashboard
                  </Link>
                )}

                <Link
                  to="/report"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/report')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-emerald-400" />
                  Report Issue
                </Link>

                <Link
                  to="/my-reports"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/my-reports')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  My Submissions
                </Link>

                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/map')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Map className="w-4 h-4 text-indigo-400" />
                  Public Map
                </Link>
              </>
            ) : (
              <Link
                to="/map"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/map')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Map className="w-4 h-4 text-indigo-400" />
                Live Issue Map
              </Link>
            )}
          </nav>

          {/* Desktop Right Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-full py-1.5 pl-3 pr-2.5 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      {user?.role === 'worker' ? 'BMC Worker' : 'Citizen'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-700/60">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-500/20 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{user?.name}</div>
                  <div className="text-xs text-amber-400 font-semibold uppercase">{user?.role}</div>
                </div>
              </div>

              {isWorker && (
                <Link
                  to="/worker-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <HardHat className="w-5 h-5 text-amber-400" />
                  Worker Dashboard
                </Link>
              )}

              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <FilePlus2 className="w-5 h-5 text-emerald-400" />
                Report Issue
              </Link>

              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <ListTodo className="w-5 h-5 text-cyan-400" />
                My Submissions
              </Link>

              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <Map className="w-5 h-5 text-indigo-400" />
                Public Map
              </Link>

              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Live Issue Map
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
