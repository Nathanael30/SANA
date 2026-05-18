import React from 'react';
import { Stethoscope, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Stethoscope className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">SANA</h1>
            <p className="text-xs text-blue-200">Maternal Assistance AI</p>
          </div>
        </Link>
        <nav className="flex space-x-4">
          <Link to="/" className="hover:text-blue-200 transition-colors font-medium">Home</Link>
          <Link to="/logs" className="hover:text-blue-200 transition-colors font-medium">Logs</Link>
        </nav>
      </div>
      <div className="bg-blue-800 text-center py-1 px-4 text-xs font-medium text-blue-200">
        <Activity className="w-3 h-3 inline mr-1" />
        Offline Mode Active
      </div>
    </header>
  );
};

export default Header;
