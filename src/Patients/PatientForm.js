import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const isEdit = !!id;
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger la liste des propriétaires
        const ownersResponse = await axios.get('/api/owners/');
        setOwners(ownersResponse.data.results);
        
        // Charger les données du patient si en mode édition
        if (isEdit) {
          const patientResponse = await axios.get(`/api/patients/${id}/`);
          formik.setValues({
            name: patientResponse.data.name,
            animal_type: patientResponse.data.animal_type,
            breed: patientResponse.data.breed,
            birth_date: patientResponse.data.birth_date,
            weight: patientResponse.data.weight,
            sex: patientResponse.data.sex,
            owner: patientResponse.data.owner.id
          });
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, [id, isEdit]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Le nom est obligatoire'),
    animal_type: Yup.string().required('Le type est obligatoire'),
    breed: Yup.string().required('La race est obligatoire'),
    birth_date: Yup.date().required('La date de naissance est obligatoire'),
    weight: Yup.number().positive('Le poids doit être positif').required('Le poids est obligatoire'),
    sex: Yup.string().required('Le sexe est obligatoire'),
    owner: Yup.number().required('Le propriétaire est obligatoire')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      animal_type: 'dog',
      breed: '',
      birth_date: '',
      weight: '',
      sex: 'M',
      owner: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const patientData = {
          ...values,
          birth_date: new Date(values.birth_date).toISOString().split('T')[0]
        };
        
        if (isEdit) {
          await axios.put(`/api/patients/${id}/`, patientData);
        } else {
          await axios.post('/api/patients/', patientData);
        }
        navigate(isEdit ? `/patients/${id}` : '/patients');
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      }
    }
  });

  return (
    <Container className="mt-4">
      <h2>{isEdit ? 'Modifier Patient' : 'Ajouter un Nouveau Patient'}</h2>
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      
      <Form onSubmit={formik.handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="name">
              <Form.Label>Nom de l'animal *</Form.Label>
              <Form.Control
                type="text"
                {...formik.getFieldProps('name')}
                isInvalid={formik.touched.name && formik.errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="owner">
              <Form.Label>Propriétaire *</Form.Label>
              <Form.Select
                {...formik.getFieldProps('owner')}
                isInvalid={formik.touched.owner && formik.errors.owner}
              >
                <option value="">Sélectionner un propriétaire</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.first_name} {owner.last_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formik.errors.owner}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="animal_type">
              <Form.Label>Type d'animal *</Form.Label>
              <Form.Select
                {...formik.getFieldProps('animal_type')}
                isInvalid={formik.touched.animal_type && formik.errors.animal_type}
              >
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="rabbit">Lapin</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group controlId="breed">
              <Form.Label>Race *</Form.Label>
              <Form.Control
                type="text"
                {...formik.getFieldProps('breed')}
                isInvalid={formik.touched.breed && formik.errors.breed}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.breed}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group controlId="sex">
              <Form.Label>Sexe *</Form.Label>
              <Form.Select
                {...formik.getFieldProps('sex')}
                isInvalid={formik.touched.sex && formik.errors.sex}
              >
                <option value="M">Mâle</option>
                <option value="F">Femelle</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="birth_date">
              <Form.Label>Date de naissance *</Form.Label>
              <Form.Control
                type="date"
                {...formik.getFieldProps('birth_date')}
                isInvalid={formik.touched.birth_date && formik.errors.birth_date}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.birth_date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="weight">
              <Form.Label>Poids (kg) *</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                {...formik.getFieldProps('weight')}
                isInvalid={formik.touched.weight && formik.errors.weight}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.weight}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-end mt-4">
          <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            {isEdit ? 'Mettre à jour' : 'Créer le patient'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PatientForm;