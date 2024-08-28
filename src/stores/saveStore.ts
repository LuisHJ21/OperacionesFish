import { create } from "zustand";
import { persist } from "zustand/middleware";

type SaveStore = {
  btnSubmit: boolean;
  submit: () => void;
  reset: () => void;
};

export const saveStore = create<SaveStore>()(
  persist(
    (set) => ({
      btnSubmit: false,
      submit: () => set({ btnSubmit: true }),
      reset: () => set({ btnSubmit: false }),
    }),
    {
      name: "DatosSave",
    }
  )
);
