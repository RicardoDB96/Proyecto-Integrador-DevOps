//frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://34.207.75.197:5000/api'; //'http://localhost:5000/api';   // ✅ Ajusta esto con la IP correcta

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;