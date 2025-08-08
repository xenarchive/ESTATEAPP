import axios from "axios";

const apiRequest = axios.create({
  baseURL: "https://estateapp-backend-4s9t.onrender.com/api",
  withCredentials: true,
});

export default apiRequest;
