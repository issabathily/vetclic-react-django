import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAppointments from '../../hooks/useAppointments';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
};

const Appointments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Utiliser le hook useAppointments
  const { 
    appointments, 
    loading, 
    error, 
    refetch, 
    deleteAppointment,
    cancelAppointment,
    completeAppointment 
  } = useAppointments(currentUser?.id);

  // Filtrer les rendez-vous par date, recherche et statut
  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = isSameDay(parseISO(appointment.date_time), currentDate);
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${appointment.patient?.owner?.first_name} ${appointment.patient?.owner?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsDeleting(id);
        await deleteAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Gérer l'annulation d'un rendez-vous
  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  };

  // Gérer la clôture d'un rendez-vous
  const handleComplete = async (id) => {
    if (window.confirm('Marquer ce rendez-vous comme terminé ?')) {
      try {
        await completeAppointment(id);
        await refetch();
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
    }
  };

  // Navigation entre les jours
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formater la date pour l'affichage
  const formattedDate = format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isCurrentDay = isToday(currentDate);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col mb-8 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rendez-vous de vos patients
          </p>
        </div>
        <button
          onClick={() => navigate('/vet/appointments/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  isCurrentDay 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  statusFilter !== 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
              </button>
            </div>
          </div>
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Statut :</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-40 py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="scheduled">Planifié</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="overflow-hidden border-b border-gray-200 rounded-b-lg">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Aucun rendez-vous ne correspond à vos critères de recherche.'
                  : `Aucun rendez-vous prévu pour le ${formattedDate}.`}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/vet/appointments/new')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2 -ml-1" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.date_time);
                const timeString = format(appointmentDate, 'HH:mm');
                const isPast = appointmentDate < new Date();
                
                return (
                  <li key={appointment.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0 mr-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                              <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-blue-600 truncate">
                                {appointment.patient?.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {timeString}
                              </span>
                            </div>
                            
                            <div className="flex mt-1">
                              <p className="flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {appointment.patient?.owner?.first_name} {appointment.patient?.owner?.last_name}
                              </p>
                            </div>
                            
                            {appointment.reason && (
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {appointment.reason}
                              </p>
                            )}
                            
                            <div className="flex mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[appointment.status] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'scheduled' && 'Planifié'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => navigate(`/vet/appointments/${appointment.id}/edit`)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleComplete(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                title="Marquer comme terminé"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Annuler"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            className="inline-flex items-center p-1.5 text-gray-400 bg-white rounded-full hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
