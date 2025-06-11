import React, { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { Plus, Trash2, User, Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
    const { users, loading, error: usersError, createUser, updateUser, deleteUser } = useUsers();
    const { isAuthenticated, logout } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            logout();
        }
    }, [isAuthenticated, logout]);

    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        phone: '',
        role: 'receptionist'
    });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (!isAuthenticated) {
                throw new Error('You must be authenticated to create a user');
            }
            await createUser(newUser);
            setNewUser({
                username: '',
                email: '',
                phone: '',
                role: 'receptionist'
            });
            setError(''); // Réinitialiser l'erreur après succès
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                if (!isAuthenticated) {
                    throw new Error('You must be authenticated to delete a user');
                }
                await deleteUser(id);
            } catch (err) {
                console.error('Error deleting user:', err);
                setError(err.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <button 
                    onClick={() => setNewUser({
                        username: '',
                        email: '',
                        phone: '',
                        role: 'receptionist'
                    })}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </button>
            </div>

            {/* Formulaire de création */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">New User</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="administrator">Administrator</option>
                            <option value="veterinarian">Veterinarian</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create User
                    </button>
                </form>
            </div>

            {/* Liste des utilisateurs */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Trash2 className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => handleDelete(user.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
