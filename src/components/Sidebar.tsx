import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

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

  return (
    <div className="w-72 bg-white/80 backdrop-blur-xl h-screen shadow-2xl border-r border-gray-200/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
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
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100' 
                  : ''
              }`
            }
          >
            <div className={`${item.color} group-hover:scale-110 transition-transform duration-200`}>
              {item.icon}
            </div>
            <span className="ml-3 font-medium">{item.label}</span>
            <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200/50 space-y-2">
        <NavLink
          to="/profile"
          className="group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
        >
          <User size={20} className="text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
          <span className="ml-3 font-medium">Profile</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className="group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
        >
          <Settings size={20} className="text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
          <span className="ml-3 font-medium">Settings</span>
        </NavLink>
        
        <button
          onClick={logout}
          className="group flex items-center w-full px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600"
        >
          <LogOut size={20} className="text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all duration-200" />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;