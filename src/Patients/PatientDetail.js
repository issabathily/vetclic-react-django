import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/patients/${id}/`);
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données du patient');
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await axios.delete(`/api/patients/${id}/`);
        navigate('/patients');
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Patient non trouvé</Alert>
      </Container>
    );
  }

  const getAnimalType = (type) => {
    switch (type) {
      case 'dog': return 'Chien';
      case 'cat': return 'Chat';
      case 'rabbit': return 'Lapin';
      default: return type;
    }
  };

  return (
    <Container className="mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-1" /> Retour
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{patient.name}</h3>
            {user && ['admin', 'receptionist'].includes(user.role) && (
              <div>
                <Button 
                  variant="light" 
                  className="me-2" 
                  as={Link} 
                  to={`/patients/edit/${id}`}
                >
                  <FaEdit /> Modifier
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  <FaTrash /> Supprimer
                </Button>
              </div>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Type:</strong> {getAnimalType(patient.animal_type)}</p>
              <p><strong>Race:</strong> {patient.breed}</p>
              <p><strong>Date de naissance:</strong> {new Date(patient.birth_date).toLocaleDateString()}</p>
              <p><strong>Âge:</strong> {calculateAge(patient.birth_date)} ans</p>
            </div>
            <div className="col-md-6">
              <p><strong>Poids:</strong> {patient.weight} kg</p>
              <p><strong>Sexe:</strong> {patient.sex === 'M' ? 'Mâle' : 'Femelle'}</p>
              <p><strong>Propriétaire:</strong> 
                <Link to={`/owners/${patient.owner.id}`} className="ms-2">
                  {patient.owner.first_name} {patient.owner.last_name}
                </Link>
              </p>
              <p><strong>Téléphone:</strong> {patient.owner.phone}</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Helper function
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default PatientDetail;