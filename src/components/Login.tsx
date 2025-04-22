import React, { useState } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login: authLogin } = useAuth();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!user.trim()) {
      toast.error('Por favor ingrese su usuario');
      return false;
    }
    if (!password.trim()) {
      toast.error('Por favor ingrese su contraseña');
      return false;
    }
    if (!companyName.trim()) {
      toast.error('Por favor ingrese el nombre de la empresa');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await login(user, password, companyName);
      authLogin(response.Token);
      toast.success('¡Inicio de sesión exitoso!');
    } catch (err) {
      toast.error('Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100" 
      style={{ 
        background: 'linear-gradient(120deg, #f6f9fc 0%, #eef1f5 100%)',
        padding: '20px'
      }}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      />
      
      <Card className="border-0" 
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease'
        }}>
        <Card.Body className="p-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold" 
              style={{ 
                color: '#2563eb', 
                fontSize: '28px',
                marginBottom: '8px'
              }}>
              Iniciar Sesión
            </h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Ingrese sus credenciales para continuar
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium ms-2 mb-2" style={{ fontSize: '14px', color: '#4b5563' }}>
                Usuario
              </Form.Label>
              <Form.Control
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Ingrese su usuario"
                className="py-3 px-4"
                style={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium ms-2 mb-2" style={{ fontSize: '14px', color: '#4b5563' }}>
                Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="py-3 px-4"
                style={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="fw-medium ms-2 mb-2" style={{ fontSize: '14px', color: '#4b5563' }}>
                Nombre de la Empresa
              </Form.Label>
              <Form.Control
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ingrese el nombre de la empresa"
                className="py-3 px-4"
                style={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-3 fw-semibold mt-2"
              style={{ 
                borderRadius: '16px', 
                background: 'linear-gradient(to right, #2563eb, #3b82f6)', 
                border: 'none', 
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                fontSize: '16px',
                letterSpacing: '0.3px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              disabled={loading}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 30px rgba(37, 99, 235, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.25)';
              }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;