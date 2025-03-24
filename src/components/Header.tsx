import React, { useState } from 'react';
import { User, Menu, Stethoscope, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';

interface Props {
  isMobile: boolean;
  onMenuClick: () => void;
}

const Header = ({ isMobile, onMenuClick }: Props) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-lighter shadow transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <>
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">PREPCLEX</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">NCLEX Prep</p>
                  </div>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.email}</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-lighter rounded-lg shadow-lg py-1 z-50">
                  <Link 
                    to="/account" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;