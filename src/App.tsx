import React, { useState, KeyboardEvent } from 'react';
import {
  Container, Row, Col, Form, Button, Table, Alert, InputGroup, Card, Badge, Spinner
} from 'react-bootstrap';
import { getProducto, createFactura } from './services/api';
import { Producto, FacturaItem, Factura } from './types';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, LogOut, Plus, Package, FileText, ShoppingCart, DollarSign, Trash2 } from 'react-feather';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [productos, setProductos] = useState<FacturaItem[]>([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [productoBuscado, setProductoBuscado] = useState<Producto | null>(null);
  const [creatingFactura, setCreatingFactura] = useState(false);

  const handleLogout = () => {
    logout();
    setProductos([]);
    setProductoBuscado(null);
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 7) {
      toast.error('El código del producto no puede tener más de 7 caracteres', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      // Mantener solo los primeros 7 caracteres
      setCodigoProducto(value.slice(0, 7));
    } else {
      setCodigoProducto(value);
    }
  };

  const buscarProducto = async () => {
    if (!codigoProducto) return;
    try {
      setLoading(true);
      setError(null);
      const producto = await getProducto(codigoProducto);
      setProductoBuscado(producto);
      toast.success('Producto encontrado', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
    } catch {
      toast.error('Error al buscar el producto', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      setProductoBuscado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && codigoProducto) {
      e.preventDefault();
      buscarProducto();
    }
  };

  const handleAgregarProducto = () => {
    if (!productoBuscado) return;
    const precio = productoBuscado.Precio[0].PrecioLista;
    const iva = precio * (productoBuscado.ProductoTasaIVA / 100);
    const nuevoProducto: FacturaItem = {
      ProductoId: productoBuscado.ProductoId,
      ProductoNombre: productoBuscado.ProductoNombre,
      Cantidad: 1,
      PrecioUnitario: precio,
      Subtotal: precio,
      IVA: iva,
      Total: precio + iva
    };
    setProductos([...productos, nuevoProducto]);
    setProductoBuscado(null);
    setCodigoProducto('');
    toast.success('Producto agregado a la factura', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"
    });
  };

  const handleCambiarCantidad = (index: number, cantidad: number) => {
    if (cantidad < 1) return;
    
    const nuevosProductos = [...productos];
    const producto = nuevosProductos[index];
    producto.Cantidad = cantidad;
    producto.Subtotal = producto.PrecioUnitario * cantidad;
    producto.IVA = producto.Subtotal * (producto.IVA / producto.Subtotal);
    producto.Total = producto.Subtotal + producto.IVA;
    setProductos(nuevosProductos);
  };

  const handleRemoveProduct = (index: number) => {
    const nuevosProductos = [...productos];
    nuevosProductos.splice(index, 1);
    setProductos(nuevosProductos);
    toast.info('Producto eliminado de la factura', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"
    });
  };

  const calcularTotales = () => {
    const totalBase = productos.reduce((sum, p) => sum + p.Subtotal, 0);
    const totalIVA = productos.reduce((sum, p) => sum + p.IVA, 0);
    const totalPagar = productos.reduce((sum, p) => sum + p.Total, 0);
    return { totalBase, totalIVA, totalPagar };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCrearFactura = async () => {
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      return;
    }

    try {
      setCreatingFactura(true);
      const facturaData: Factura = {
        DocumentoId: 14,
        FacturaResolucionTipo: "04",
        FacturaFecha: new Date().toISOString().split('T')[0],
        ClienteId: "1",
        FacturaTipoOperacion: "1",
        FacturaBodegaId: "01",
        FacturaTipoPago: "E",
        Detalle: productos.map(p => ({
          ProductoId: p.ProductoId,
          FacturaDetalleCantidad: p.Cantidad,
          FacturaDetalleVrUnitario: p.PrecioUnitario,
          FacturaDetalleDcto: 0,
          FacturaDetalleTotalPC: 0,
          FacturaDetalleTipoFlete: "N",
          FacturaDetalleNotaLong: "",
          FacturaLoteId: "0"
        }))
      };

      const response = await createFactura(facturaData);
      setProductos([]);
      setError(null);
      toast.success(`Factura creada exitosamente con ID: ${response.FacturaId}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
    } catch {
      toast.error('Error al crear la factura', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
    } finally {
      setCreatingFactura(false);
    }
  };

  if (!isAuthenticated) return <Login />;

  const { totalBase, totalIVA, totalPagar } = calcularTotales();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to right, #f8f9fa, #e9ecef)'
    }}>
      <Container className="py-4">
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
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <h2 className="mb-0 d-flex align-items-center">
                  <FileText size={28} className="text-primary me-2" />
                  <span style={{ 
                    background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Sistema de Facturación
                  </span>
                </h2>
              </Col>
              <Col className="text-end">
                <Button variant="outline-danger" onClick={handleLogout} className="rounded-pill">
                  <LogOut size={16} className="me-1" /> Cerrar Sesión
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4 shadow-sm border-0 rounded-3">
          <Card.Body className="p-4">
            <h5 className="mb-3 d-flex align-items-center">
              <Search size={18} className="text-primary me-2" />
              Buscar Producto
            </h5>
            <Row>
              <Col md={8}>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el código del producto (ej: 3001)"
                    value={codigoProducto}
                    onChange={handleCodigoChange}
                    onKeyPress={handleKeyPress}
                    className="border-0 py-2"
                  />
                  <Button
                    variant="primary"
                    onClick={buscarProducto}
                    disabled={loading || !codigoProducto}
                    className="px-4"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <Search size={18} /> Buscar
                      </>
                    )}
                  </Button>
                </InputGroup>
                <small className="text-muted mt-2 d-block">
                  Presione Enter para buscar o haga clic en el botón
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {productoBuscado && (
          <Card className="mb-4 border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              <h5 className="d-flex align-items-center text-primary mb-4">
                <Package size={18} className="me-2" />
                Producto Encontrado
              </h5>
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <span className="text-muted">Código:</span>
                    <h6 className="mb-0">{productoBuscado.ProductoId}</h6>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted">Producto:</span>
                    <h5 className="mb-0">{productoBuscado.ProductoNombre}</h5>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <span className="text-muted">Precio:</span>
                    <h5 className="mb-0">{formatCurrency(productoBuscado.Precio[0].PrecioLista)}</h5>
                  </div>
                  <div>
                    <span className="text-muted">IVA:</span>
                    <Badge bg="info" className="ms-2 rounded-pill">{productoBuscado.ProductoTasaIVA}%</Badge>
                  </div>
                </Col>
                <Col md={3} className="text-end">
                  <Button
                    variant="success"
                    onClick={handleAgregarProducto}
                    className="rounded-pill"
                  >
                    <Plus size={18} className="me-1" /> Agregar a Factura
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Card className="mb-4 border-0 shadow-sm rounded-3">
          <Card.Body className="p-4">
            <h5 className="d-flex align-items-center mb-4">
              <ShoppingCart size={18} className="text-primary me-2" />
              Detalle de Productos
              <Badge bg="primary" className="ms-2 rounded-pill">{productos.length}</Badge>
            </h5>
            
            {productos.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Package size={40} className="mb-3 opacity-50" />
                <h6>No hay productos agregados a la factura</h6>
                <p className="small">Busque y agregue productos para continuar</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="fw-semibold">Código</th>
                      <th className="fw-semibold">Producto</th>
                      <th className="fw-semibold text-center" style={{ width: '120px' }}>Cantidad</th>
                      <th className="fw-semibold text-end">Precio</th>
                      <th className="fw-semibold text-end">Subtotal</th>
                      <th className="fw-semibold text-end">IVA</th>
                      <th className="fw-semibold text-end">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto, index) => (
                      <tr key={index}>
                        <td>{producto.ProductoId}</td>
                        <td>{producto.ProductoNombre}</td>
                        <td>
                          <InputGroup size="sm">
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => handleCambiarCantidad(index, producto.Cantidad - 1)}
                              disabled={producto.Cantidad <= 1}
                            >-</Button>
                            <Form.Control
                              type="number"
                              min="1"
                              value={producto.Cantidad}
                              onChange={(e) => handleCambiarCantidad(index, parseInt(e.target.value) || 1)}
                              className="text-center"
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => handleCambiarCantidad(index, producto.Cantidad + 1)}
                            >+</Button>
                          </InputGroup>
                        </td>
                        <td className="text-end">{formatCurrency(producto.PrecioUnitario)}</td>
                        <td className="text-end">{formatCurrency(producto.Subtotal)}</td>
                        <td className="text-end">{formatCurrency(producto.IVA)}</td>
                        <td className="text-end fw-bold">{formatCurrency(producto.Total)}</td>
                        <td className="text-center">
                          <Button 
                            variant="link" 
                            className="text-danger p-0" 
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="mb-4 border-0 shadow-sm rounded-3" 
              style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
          <Card.Body className="p-4">
            <h5 className="d-flex align-items-center mb-4">
              <DollarSign size={18} className="text-primary me-2" />
              Resumen de la Factura
            </h5>
            <Row>
              <Col md={{ span: 5, offset: 7 }}>
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td><span className="text-muted">Subtotal:</span></td>
                      <td className="text-end fw-semibold">{formatCurrency(totalBase)}</td>
                    </tr>
                    <tr>
                      <td><span className="text-muted">IVA:</span></td>
                      <td className="text-end fw-semibold">{formatCurrency(totalIVA)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #dee2e6' }}>
                      <td><span className="fw-bold fs-5">Total:</span></td>
                      <td className="text-end fw-bold fs-5 text-primary">{formatCurrency(totalPagar)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="text-end">
          <Button
            variant="primary"
            onClick={handleCrearFactura}
            disabled={creatingFactura || productos.length === 0}
            className="rounded-pill px-4 py-2"
            size="lg"
            style={{ 
              background: 'linear-gradient(45deg, #28a745, #20c997)',
              border: 'none',
              boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)'
            }}
          >
            {creatingFactura ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                <FileText size={18} className="me-2" /> Crear Factura
              </>
            )}
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default App;