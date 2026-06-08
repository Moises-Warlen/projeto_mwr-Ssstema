import axios from 'axios';

const api = axios.create({
    baseURL: 'https://projeto-mwr-ssstema-1.onrender.com/api'
});

export default api;