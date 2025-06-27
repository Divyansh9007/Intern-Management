import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  FileText,
  UserCheck,
  LogOut,
  User,
  Calendar,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', color: 'text-blue-600' },
    { path: '/interns', icon: <Users size={20} />, label: 'Interns', color: 'text-green-600' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks', color: 'text-purple-600' },
    { path: '/attendance', icon: <UserCheck size={20} />, label: 'Attendance', color: 'text-orange-600' },
    { path: '/performance', icon: <TrendingUp size={20} />, label: 'Performance', color: 'text-pink-600' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Reports', color: 'text-indigo-600' },
    { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar', color: 'text-red-600' },
    { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: 'text-cyan-600' },
  ];

  const internMenuItems = [
    { path: '/intern-dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', color: 'text-blue-600' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'My Tasks', color: 'text-purple-600' },
    { path: '/attendance', icon: <UserCheck size={20} />, label: 'Attendance', color: 'text-orange-600' },
    { path: '/performance', icon: <TrendingUp size={20} />, label: 'Performance', color: 'text-pink-600' },
    { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar', color: 'text-red-600' },
    { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages', color: 'text-cyan-600' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : internMenuItems;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={closeMobileMenu}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                InternHub
              </h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 min-h-0">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100' 
                      : ''
                  }`
                }
              >
                <div className={`${item.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                  {item.icon}
                </div>
                <span className="ml-3 font-medium truncate">{item.label}</span>
                <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200/50 space-y-2 flex-shrink-0">
          <NavLink
            to="/profile"
            onClick={closeMobileMenu}
            className="group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
          >
            <User size={20} className="text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
            <span className="ml-3 font-medium truncate">Profile</span>
          </NavLink>
          
          <NavLink
            to="/settings"
            onClick={closeMobileMenu}
            className="group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
          >
            <Settings size={20} className="text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
            <span className="ml-3 font-medium truncate">Settings</span>
          </NavLink>
          
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="group flex items-center w-full px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600"
          >
            <LogOut size={20} className="text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
            <span className="ml-3 font-medium truncate">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;