import axios from "axios";
import { base_url } from '../config';

export const authAxios = axios.create({
  baseURL: base_url,
  withCredentials: true  // Sends cookies with every request
});

// Use this instance for authenticated requests
// Example: authAxios.get('/protected-endpoint/');