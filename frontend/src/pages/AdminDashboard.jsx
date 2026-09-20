import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminMovies from '../components/AdminMovies';
import AdminReviews from '../components/AdminReviews';
import AdminUsers from '../components/AdminUsers';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-red-500">Admin Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('movies')}
              className={`text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'movies' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              Manage Movies
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'reviews' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              Moderate Reviews
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`text-left px-4 py-2 rounded transition-colors ${
                activeTab === 'users' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              User Overview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:w-3/4">
          <div className="bg-gray-900 rounded-lg p-6 min-h-[500px]">
            {activeTab === 'movies' && <AdminMovies />}
            {activeTab === 'reviews' && <AdminReviews />}
            {activeTab === 'users' && <AdminUsers />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
