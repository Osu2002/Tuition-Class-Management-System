// Central axios instance + helper to set/remove Basic token
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8081",
});

export function setApiAuth(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = "Basic " + token;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
