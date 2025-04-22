import axios from "axios";

const BASE_URL = "https://demolact.arco365.com/ArcoERP/v2";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const { token: authToken } = JSON.parse(token);
      config.headers.Authorization = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const login = async (
  user: string,
  password: string,
  companyName: string
) => {
  try {
    const response = await api.post("/Security/Login", {
      User: user,
      Password: password,
      CompanyName: companyName,
    });

    return response.data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

export const getProducto = async (codigo: string) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await api.get(`/Producto/Get/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    if (axios.isAxiosError(error)) {
      console.error("Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

export const createFactura = async (facturaData: any) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await api.post("/Factura/Insert", facturaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear factura:", error);
    if (axios.isAxiosError(error)) {
      console.error("Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

export default api;
