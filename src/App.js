import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import Layout from './components/layout/Layout';

import Alert from './components/Alert';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import OwnerDetail from './pages/OwnerDetail';
import AddOwner from './components/owners/AddOwner';
import OwnerForm from './components/owners/OwnerForm';

import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import PatientForm from './components/patients/PatientForm';

import Roles from './pages/Roles';
import UserManagement from './components/auth/UserManagement';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <Alert />
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                
                {/* Routes Admin */}
                <Route path="admin" element={<RoleProtectedRoute roles={['administrator']} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="roles" element={<Roles />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="owners" element={<Owners />} />
                  <Route path="owners/:id" element={<OwnerDetail />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="patients/:id" element={<PatientDetail />} />
                </Route>

                {/* Routes Vétérinaire */}
                <Route path="vet" element={<RoleProtectedRoute roles={['administrator', 'veterinarian']} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="patients/:id" element={<PatientDetail />} />
                </Route>

                {/* Routes Réceptionniste */}
                <Route path="reception" element={<RoleProtectedRoute roles={['receptionist']} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="owners" element={<Owners />} />
                  <Route path="owners/:id" element={<OwnerDetail />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="patients/:id" element={<PatientDetail />} />
                </Route>

                {/* Routes communes */}
                <Route path="owners/create" element={<AddOwner />} />
                <Route path="owners/:id/edit" element={<OwnerForm />} />
                <Route path="patients/new" element={<PatientForm />} />
                <Route path="patients/:id/edit" element={<PatientForm />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
