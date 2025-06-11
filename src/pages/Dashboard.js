import React from 'react';
import { PieChart, Stethoscope, Users, UserCog, UserPlus, UserMinus, UserCheck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentPatients from '../components/dashboard/RecentPatients';
import RecentOwners from '../components/dashboard/RecentOwners';
import { usePatients } from '../hooks/usePatients';
import { useOwners } from '../hooks/useOwners';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { patients, loading: loadingPatients } = usePatients();
  const { owners, loading: loadingOwners } = useOwners();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Sécurisation des données
  const safePatients = Array.isArray(patients) ? patients : [];
  const safeOwners = Array.isArray(owners) ? owners : [];

  const stats = {
    totalPatients: safePatients.length,
    totalOwners: safeOwners.length,
    activeAppointments: safePatients.filter(p => p.lastVisit).length,
    totalUsers: user?.role === 'administrator' ? 1 : 0,
  };

  const handleAddUser = () => navigate('/admin/user-management');
  const handleManageUsers = () => navigate('/admin/users');
  const handleManageRoles = () => navigate('/admin/roles');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {user?.role === 'administrator' ? 'Dashboard Administrateur' : 'Dashboard'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Stethoscope className="h-8 w-8 text-blue-500" />}
          color="bg-blue-50 bg-opacity-10 hover:bg-opacity-20 shadow-sm hover:shadow-md transition-all duration-300"
          textColor="text-blue-500"
        />
        <StatCard
          title="Total Owners"
          value={stats.totalOwners}
          icon={<Users className="h-8 w-8 text-purple-500" />}
          color="bg-purple-50 bg-opacity-10 hover:bg-opacity-20 shadow-sm hover:shadow-md transition-all duration-300"
          textColor="text-purple-500"
        />
        {user?.role === 'administrator' && (
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            icon={<UserCog className="h-8 w-8 text-green-500" />}
            color="bg-green-50 bg-opacity-10 hover:bg-opacity-20 shadow-sm hover:shadow-md transition-all duration-300"
            textColor="text-green-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Patients</h2>
          <RecentPatients />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Owners</h2>
          <RecentOwners />
        </div>
      </div>

      {user?.role === 'administrator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h2>
            <div className="space-y-4">
              <button
                onClick={handleAddUser}
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <UserPlus className="h-6 w-6 text-blue-500 mr-3" />
                <span>Ajouter un utilisateur</span>
              </button>
              <button
                onClick={handleManageUsers}
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Users className="h-6 w-6 text-purple-500 mr-3" />
                <span>Gérer les utilisateurs</span>
              </button>
              <button
                onClick={handleManageRoles}
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <UserCheck className="h-6 w-6 text-green-500 mr-3" />
                <span>Gérer les rôles</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
