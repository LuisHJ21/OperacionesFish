import { useEffect, useState } from "react";
import { equipo, newObs, newOperacion } from "../types";
import { UseFormRegister } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosClient } from "../services/axios";

type propFunc = {
  seleccionarEquipo: Function;
  equipoSel: equipo;
  register: UseFormRegister<newObs | newOperacion | any>;
};

export default function SelEquipos({
  seleccionarEquipo,
  equipoSel,
  register,
}: propFunc) {
  // const urlApi = import.meta.env.VITE_API_URL;

  const [equipos, getEquipos] = useState([]);
  const { pathname } = useLocation();
  const pathSplit = pathname.split("/");
  let actPage = "";
  if (pathSplit.length == 2) {
    actPage = pathSplit[1];
  } else {
    actPage = pathSplit[2];
  }

  const obtenerEquipos = async () => {
    const url = `/api/equipos`;

    try {
      const peticion = await axiosClient.get(url);
      const { data } = peticion.data;
      getEquipos(data);
    } catch (error: any) {
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR AL OBTENER EQUIPOS", { theme: "dark" });
      }
    }
  };

  const searchEquipo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const maq = e.target.value;

    const datos = equipos.find((eq) => eq["cod_maq"] === maq);

    if (datos === undefined) {
      const dataNull = {
        cod_maq: "",
        denom: "",
        flag_estado: "",
        num_comp: 0,
        num_ord: 0,
        nom_corto: "",
        num_horom: "",
      };

      seleccionarEquipo(dataNull);
      return;
    }
    seleccionarEquipo(datos);
  };

  useEffect(() => {
    obtenerEquipos();
  }, []);

  return (
    <select
      className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg text-lg uppercase text-center font-semibold"
      {...register("equipo", {})}
      onChange={searchEquipo}
      value={equipoSel["cod_maq"]}
    >
      <option value="">
        {actPage === "observaciones" ? "GENERAL" : "SELECCIONE EQUIPO"}
      </option>
      {equipos.map((equi) => (
        <option key={equi["cod_maq"]} value={equi["cod_maq"]}>
          {equi["denom"]}
        </option>
      ))}
    </select>
  );
}
