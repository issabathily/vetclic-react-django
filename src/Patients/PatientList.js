import React, { useState, useEffect } from 'react';
import { Table, Button, Container, InputGroup, FormControl, Pagination, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [animalTypeFilter, setAnimalTypeFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [owners, setOwners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const params = {
          search,
          animal_type: animalTypeFilter,
          owner: ownerFilter,
          page: currentPage
        };
        const response = await axios.get('/api/patients/', { params });
        setPatients(response.data.results);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } catch (error) {
        console.error('Erreur lors du chargement des patients', error);
      }
    };

    const fetchOwners = async () => {
      try {
        const response = await axios.get('/api/owners/');
        setOwners(response.data.results);
      } catch (error) {
        console.error('Erreur lors du chargement des propriétaires', error);
      }
    };

    fetchPatients();
    fetchOwners();
  }, [search, animalTypeFilter, ownerFilter, currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await axios.delete(`/api/patients/${id}/`);
        setPatients(patients.filter(patient => patient.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression', error);
      }
    }
  };

  const getAnimalTypeLabel = (type) => {
    switch (type) {
      case 'dog': return 'Chien';
      case 'cat': return 'Chat';
      case 'rabbit': return 'Lapin';
      default: return type;
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestion des Patients</h2>
        {user && ['admin', 'receptionist'].includes(user.role) && (
          <Button as={Link} to="/patients/new" variant="success">
            <FaPlus className="me-1" /> Ajouter
          </Button>
        )}
      </div>

      <div className="mb-3">
        <InputGroup className="mb-2">
          <FormControl
            placeholder="Rechercher par nom, race..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>

        <div className="row">
          <div className="col-md-6 mb-2">
            <Form.Select 
              value={animalTypeFilter} 
              onChange={(e) => setAnimalTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="dog">Chien</option>
              <option value="cat">Chat</option>
              <option value="rabbit">Lapin</option>
            </Form.Select>
          </div>
          <div className="col-md-6 mb-2">
            <Form.Select 
              value={ownerFilter} 
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="">Tous les propriétaires</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.first_name} {owner.last_name}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Race</th>
            <th>Propriétaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.id}</td>
              <td>{patient.name}</td>
              <td>{getAnimalTypeLabel(patient.animal_type)}</td>
              <td>{patient.breed}</td>
              <td>{patient.owner.first_name} {patient.owner.last_name}</td>
              <td>
                <Button as={Link} to={`/patients/${patient.id}`} variant="info" size="sm" className="me-1">
                  Détails
                </Button>
                {user && ['admin', 'receptionist'].includes(user.role) && (
                  <>
                    <Button as={Link} to={`/patients/edit/${patient.id}`} variant="warning" size="sm" className="me-1">
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(patient.id)}>
                      <FaTrash />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)} 
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)} 
          />
        </Pagination>
      )}
    </Container>
  );
};

export default PatientList;