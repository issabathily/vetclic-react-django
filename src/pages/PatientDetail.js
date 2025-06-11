import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Edit, 
    Trash2, 
    Cat, 
    Dog, 
    Squirrel, 
    Calendar, 
    Weight, 
    Ruler, 
    Thermometer, 
    Users, 
    Clock, 
    AlertTriangle
} from 'lucide-react';
import { usePatientDetail } from '../hooks/usePatientDetail';
import PatientForm from '../components/patients/PatientForm';

const PatientDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, loading, error, updatePatient, deletePatient } = usePatientDetail(id);
  const [activeTab, setActiveTab] = useState('overview');
  const isEditing = location.pathname.includes('/edit');
  const [deleteError, setDeleteError] = useState('');

  const getAnimalIcon = (type) => {
    switch (type) {
      case 'dog':
        return <Dog className="h-6 w-6 text-amber-600" />;
      case 'cat':
        return <Cat className="h-6 w-6 text-gray-600" />;
      case 'rabbit':
        return <Squirrel className="h-6 w-6 text-brown-600" />;
      default:
        return <Squirrel className="h-6 w-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || deleteError}</p>
            </div>
          </div>
        </div>
        <Link to="/patients" className="inline-flex items-center text-teal-600 hover:text-teal-900">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Patients
        </Link>
      </div>
    );
  }

  const calculateAge = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDateObj.getDate())) {
      years--;
      months += 12;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/patients" className="inline-flex items-center text-teal-600 hover:text-teal-900">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Patients
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <Link to="/patients" className="inline-flex items-center text-teal-600 hover:text-teal-900">
                    <ChevronLeft className="h-5 w-5" />
                    <span>Back to Patients</span>
                </Link>
                <h2 className="text-2xl font-semibold text-gray-900">
                    {patient?.name} {getAnimalIcon(patient?.type)}
                </h2>
            </div>
            <div className="flex space-x-2">
              <Link
                to={isEditing ? `/patients/${id}` : `/patients/${id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </Link>
              <button
                onClick={async () => {
                  try {
                    await deletePatient();
                    navigate('/patients');
                  } catch (error) {
                    console.error('Delete error:', error);
                    setDeleteError('Failed to delete patient: ' + (error.response?.data?.detail || error.message));
                  }
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-2 sm:px-6 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'medicalHistory'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('medicalHistory')}
              >
                Medical History
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'appointments'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('appointments')}
              >
                Appointments
              </button>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="px-4 py-5 sm:p-6">
              {isEditing ? (
                <PatientForm initialData={patient} />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date of Birth
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(patient.birthDate).toLocaleDateString()}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Age
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{calculateAge(patient.birthDate)}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Weight className="h-4 w-4 mr-2" />
                          Weight
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{patient.weight} kg</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Ruler className="h-4 w-4 mr-2" />
                          Height
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{patient.height} cm</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Thermometer className="h-4 w-4 mr-2" />
                          Temperature
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{patient.temperature}°C</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Sex</dt>
                        <dd className="mt-1 text-sm text-gray-900">{patient.sex}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h4>
                    <dl>
                      <div className="sm:col-span-2 mb-4">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Owner
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <Link to={`/owners/${patient.owner.id}`} className="text-teal-600 hover:text-teal-900">
                            {patient.owner.name}
                          </Link>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">{patient.owner.phone}</dd>
                      </div>
                    </dl>
                    
                    <div className="mt-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Last Visit</h4>
                      <p className="text-sm text-gray-900">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'medicalHistory' && (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Medical History</h4>
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  Add Record
                </button>
              </div>
              
              <div className="overflow-hidden">
                <div className="relative">
                  {patient.medicalHistory.map((record, index) => (
                    <div key={index} className="relative pb-8">
                      {index < patient.medicalHistory.length - 1 && (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center ring-8 ring-white">
                            <Calendar className="h-5 w-5 text-teal-500" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 py-1.5">
                          <div className="text-sm text-gray-500">
                            <div className="font-medium text-gray-900 mb-1">
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                            <div className="mt-2 bg-white rounded-lg border border-gray-200 p-4">
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-500">Diagnosis:</span>
                                <p className="text-sm text-gray-900">{record.diagnosis}</p>
                              </div>
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-500">Treatment:</span>
                                <p className="text-sm text-gray-900">{record.treatment}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">Notes:</span>
                                <p className="text-sm text-gray-900">{record.notes}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Upcoming Appointments</h4>
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  Schedule Appointment
                </button>
              </div>
              
              <div className="bg-white overflow-hidden">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Schedule a new appointment for this patient.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;