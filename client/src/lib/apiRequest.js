// src/lib/apiRequest.js
import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:8800/api",  // 👈 Make sure this matches your backend
  withCredentials: true  // 👈 Required if you're using cookies (like JWT)
});

export default apiRequest;
