import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  BarChart2, 
  FileText, 
  Settings, 
  HelpCircle,
  BookOpen,
  Stethoscope,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobile }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/study-planner', icon: Calendar, label: 'Study Planner' },
    { path: '/create-test', icon: PlusCircle, label: 'Create Test' },
    { path: '/previous-tests', icon: ClipboardList, label: 'Previous Tests' },
    { path: '/performance', icon: BarChart2, label: 'Performance' },
    { path: '/study-resources', icon: BookOpen, label: 'Study Resources' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/account', icon: Settings, label: 'My Account' },
    { path: '/admin', icon: ShieldCheck, label: 'Admin Dashboard', isAdmin: true }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onToggleCollapse();
    }
  };

  // If mobile and sidebar is not explicitly opened, don't render
  if (isMobile && isCollapsed) {
    return null;
  }

  return (
    <aside className={`
      fixed top-0 left-0 h-screen bg-white dark:bg-dark-lighter shadow-lg transition-all duration-300 z-50
      ${isCollapsed ? 'w-16' : 'w-64'}
      ${isMobile ? 'w-64' : ''}
    `}>
      <div className="flex flex-col h-full relative">
        {/* Logo - Only show in sidebar when not mobile */}
        {!isMobile && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">PREPCLEX</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">NCLEX Prep</p>
                </div>
              )}
            </Link>
          </div>
        )}

        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {(!isCollapsed || isMobile) && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </nav>

          {(!isCollapsed || isMobile) && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-dark rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Need help?</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Please check our docs</p>
                <button 
                  onClick={() => handleNavigation('/help')}
                  className="w-full bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Documentation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;