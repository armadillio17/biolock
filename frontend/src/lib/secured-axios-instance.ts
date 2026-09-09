import axios from "axios";

export const authAxios = axios.create({
  withCredentials: true
});

// Use this instance for authenticated requests. Call sites spell out the API
// prefix themselves, e.g. authAxios.get(`${base_url}/protected-endpoint/`), so
// no baseURL is set here -- setting one would double the prefix now that
// base_url is a relative path.
