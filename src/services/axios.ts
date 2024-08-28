import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "/operacionesv2",
});
