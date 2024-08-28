import { create } from "zustand";
import { auth } from "../types";
import { persist } from "zustand/middleware";
import moment from "moment";

type AuthStore = {
  stateAuth: boolean;
  // turno:string,
  auth: auth | null;
  horaLogin: string | null;
  login: (data: auth) => void;
  logout: () => void;
  editAuth: (data: auth) => void;
};

export const authStore = create<AuthStore>()(
  persist(
    (set) => ({
      stateAuth: false,
      auth: null,
      horaLogin: null,
      login: (data) =>
        set({
          stateAuth: true,
          auth: data,
          horaLogin: moment().format("YYYY-MM-DD HH:mm:ss"),
        }),
      logout: () => set({ auth: null, stateAuth: false, horaLogin: null }),
      editAuth: (data) => set({ auth: data }),
    }),
    {
      name: "DatosAuth",
    }
  )
);
