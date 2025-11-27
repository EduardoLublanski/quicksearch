import axios from "axios";

// cria instância base do Axios
const authAxios = axios.create({
  baseURL: "http://localhost:8080/api/v1/quicksearch",
});

// interceptor para adicionar o token JWT em todas as requisições
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// interceptor para lidar com respostas de erro e expiração do token
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // token expirou ou inválido
      localStorage.removeItem("jwtToken");
      window.location.href = "/"; // redireciona para login
    }
    return Promise.reject(error);
  }
);

export default authAxios;
