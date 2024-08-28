import { useEffect, useState } from "react";
import {
  faArrowAltCircleDown,
  faAsterisk,
  faArrowAltCircleUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";
import { authStore } from "../stores/loginStore";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveStore } from "../stores/saveStore";
import { newCarga } from "../types";
import { useForm } from "react-hook-form";
import ErrorValid from "../components/ErrorValid";
import { axiosClient } from "../services/axios";

type Equipo = {
  TURNO: string;
};

type PlaTun = {
  cod_item: string;
  denom: string;
  cod_maq: string;
};
type HistorialItem = {
  cod_item: string;
  proceso: string;
  peso: number | null; // Puedes ajustar el tipo de 'peso' según corresponda
  hora_reg: string;
  proceso_txt: string;
  hora: string;
  equipo: Equipo;
  platun: PlaTun;
};

type UltItem = {
  item: string;
  proceso: string;
  hora: string;
  peso: number | null; // Puedes ajustar el tipo de 'peso' según corresponda
};

type Data = {
  historial: HistorialItem[];
  ult: UltItem[];
};
export default function CargaView() {
  // const urlApi = import.meta.env.VITE_API_URL;

  const [lista, getLista] = useState<PlaTun[]>([]);

  const [carga, getCarga] = useState<Data>({
    historial: [],
    ult: [],
  });
  const { auth } = authStore();
  const submitForm = saveStore((state) => state.btnSubmit);
  const resetForm = saveStore((state) => state.reset);

  const {
    register,
    reset,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
  } = useForm<newCarga>();

  // const [searchP, getSearchP] = useState("");

  const obtenerPlaTun = async () => {
    const url = `/api/carga`;
    try {
      const peticion = await axiosClient.get(url);

      const { data } = peticion.data;
      getLista(data);
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
  const obtenerCarga = async () => {
    const url = `/api/carga/historial`;
    try {
      const peticion = await axiosClient.post(url, {
        turno: auth ? auth["turno"] : "",
        fecha: auth ? auth["fecha"] : "",
      });

      const { data } = peticion.data;
      getCarga(data);
    } catch (error: any) {
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR AL OBTENER HISTORIAL", { theme: "dark" });
      }
    }
  };

  const enviarFormulario = async (datos: newCarga) => {
    const url = `/api/carga`;

    try {
      const peticion = await axiosClient.post(url, {
        item: datos["item"],
        proceso: datos["proceso"],
        peso: datos["peso"],
        obs: datos["obs"],
        id: auth ? auth["codOper"] : "",
      });

      const { data } = peticion.data;

      toast.success(data, {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      toast.error("ERROR AL GUARDAR DATOS", {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      resetForm();
      reset();
      obtenerCarga();
    }
  };

  useEffect(() => {
    if (submitForm) {
      const btn: HTMLElement | null = document.querySelector("#btnSubmit");

      btn?.click();
    }
  }, [submitForm]);

  useEffect(() => {
    if (
      isSubmitting &&
      (!isValid || Object.keys(errors).length > 0) &&
      submitForm
    ) {
      resetForm();
      console.log("reseteado");
    }
  }, [isSubmitting]);

  useEffect(() => {
    obtenerCarga();
    obtenerPlaTun();
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(enviarFormulario)}>
        <div className="flex wrap pt-3 px-6 gap-4 xs:flex-col">
          <div className="w-1/3 xs:w-full">
            <label className="uppercase font-bold text-white">Item</label>
            <select
              className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg text-lg uppercase text-center font-semibold"
              {...register("item", {
                required: "SELECCIONE ITEM",
              })}
            >
              <option value="" disabled>
                Seleccione
              </option>
              {lista.length > 0 &&
                lista.map((op) => (
                  <option key={op["cod_item"]} value={op["cod_item"]}>
                    {op["denom"]}
                  </option>
                ))}
            </select>
            {errors.item && (
              <ErrorValid
                message={errors.item.message ? errors.item.message : ""}
              />
            )}
          </div>
          <div className="w-1/3 xs:w-full">
            <label className="uppercase font-bold text-white">proceso</label>
            <select
              className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg text-lg uppercase text-center font-semibold"
              {...register("proceso", {
                required: "SELECCIONE PROCESO",
              })}
            >
              {/* <option value="">Seleccione</option> */}
              <option value="1">START</option>
              <option value="2">DEFROST</option>
              <option value="3">STOP</option>
            </select>
            {errors.proceso && (
              <ErrorValid
                message={errors.proceso.message ? errors.proceso.message : ""}
              />
            )}
          </div>
          <div className="w-1/3 xs:w-full">
            <label className="uppercase font-bold text-white">peso</label>
            <div className="flex w-100">
              <input
                type="number"
                className="w-full border-2 border-gray-300 h-10 px-3 rounded-l-lg text-right uppercase text-lg font-semibold"
                {...register("peso")}
              />
              <span className="w-20 text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                KG
              </span>
            </div>
          </div>
        </div>

        <div className="flex wrap pt-3 px-6">
          <div className="w-full">
            <label className="uppercase font-bold text-white">
              observacion
            </label>
            <textarea
              className="w-full border-2 border-gray-300 bg-white px-3 py-1 rounded-lg text-sm uppercase"
              rows={10}
              {...register("obs")}
            ></textarea>
          </div>
        </div>
        <button className="hidden" id="btnSubmit" type="submit">
          prueba
        </button>
      </form>
      <ToastContainer />
      <div className="flex wrap pt-3 px-6 gap-6 xs:flex-col">
        <div className="w-1/2 text-white xs:w-full">
          <div className="flex pb-3">
            <div className="w-1/2 self-center">
              <span className="uppercase font-bold text-lg ">placas</span>
            </div>
            {/* <div className="w-1/2">
              <div className="flex text-gray-600">
                <span className="w-20 text-center content-center  bg-gray-200 border-2 border-gray-300 rounded-l-lg">
                  <FontAwesomeIcon icon={faFilter} size="xl" />
                </span>
                <select
                  className="w-full border-2 border-gray-300  rounded-r-lg h-10 px-3 uppercase text-center"
                  onChange={SearchPlaca}
                >
                  <option value="">seleccione</option>
                  {lista.map(
                    (elem) =>
                      !elem["denom"].includes("TUNEL") && (
                        <option key={elem["cod_item"]} value={elem["cod_item"]}>
                          {elem["denom"]}
                        </option>
                      )
                  )}
                </select>
              </div>
            </div> */}
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 uppercase border-b-4 border-white ">
                <th className="py-2"></th>
                <th className="py-2">item</th>
                <th className="py-2">proceso</th>
                <th className="py-2">hora</th>
                <th className="py-2">Peso (KG)</th>
              </tr>
            </thead>
            <tbody>
              {carga.hasOwnProperty("historial") &&
                carga.historial.map(
                  (placa) =>
                    !placa["platun"]["denom"].includes("TUNEL") && (
                      <tr
                        key={uuidv4()}
                        className="uppercase border-b-2 border-white hover:bg-gray-400"
                      >
                        <td className="text-center py-2">
                          {placa["proceso"] == "1" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleUp}
                              className="text-green-500"
                              size="lg"
                            />
                          ) : placa["proceso"] == "3" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleDown}
                              className="text-red-500"
                              size="lg"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faAsterisk}
                              className="text-blue-400"
                              size="lg"
                            />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {placa["platun"]["denom"]}
                        </td>
                        <td className="text-center py-2">
                          {placa["proceso_txt"]}
                        </td>
                        <td className="text-center py-2">{placa["hora"]}</td>
                        <td className="text-right py-2">{placa["peso"]}</td>
                      </tr>
                    )
                )}

              {carga.hasOwnProperty("ult") &&
                carga.ult.map(
                  (placa) =>
                    !placa["item"].includes("TUNEL") && (
                      <tr
                        key={uuidv4()}
                        className="uppercase border-b-2 border-white bg-gray-600 hover:bg-gray-400"
                      >
                        <td className="text-center py-2">
                          {placa["proceso"] == "Start" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleUp}
                              className="text-green-500"
                              size="lg"
                            />
                          ) : placa["proceso"] == "Stop" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleDown}
                              className="text-red-500"
                              size="lg"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faAsterisk}
                              className="text-blue-400"
                              size="lg"
                            />
                          )}
                        </td>
                        <td className="text-center py-2">{placa["item"]}</td>
                        <td className="text-center py-2">{placa["proceso"]}</td>
                        <td className="text-center py-2">{placa["hora"]}</td>
                        <td className="text-right py-2">{placa["peso"]}</td>
                      </tr>
                    )
                )}
            </tbody>
          </table>
        </div>
        <div className="w-1/2 text-white xs:w-full">
          <div className="flex pb-3 ">
            <div className="w-1/2 self-center">
              <span className="uppercase font-bold text-lg ">túneles</span>
            </div>
            {/* <div className="w-1/2">
              <div className="flex text-gray-600">
                <span className="w-20 text-center content-center  bg-gray-200 border-2 border-gray-300 rounded-l-lg">
                  <FontAwesomeIcon icon={faFilter} size="xl" />
                </span>
                  <select className="w-full border-2 border-gray-300  rounded-r-lg h-10 px-3 uppercase text-center">
                  <option value="">seleccione</option>
                  {lista.map(
                    (elem) =>
                      !elem["denom"].includes("PLACA") && (
                        <option key={elem["cod_item"]} value={elem["cod_item"]}>
                          {elem["denom"]}
                        </option>
                      )
                  )}
                </select> 
              </div>
            </div> */}
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 uppercase border-b-4 border-white ">
                <th className="py-2"></th>
                <th className="py-2">item</th>
                <th className="py-2">proceso</th>
                <th className="py-2">hora</th>
                <th className="py-2">Peso (KG)</th>
              </tr>
            </thead>
            <tbody>
              {carga.hasOwnProperty("historial") &&
                carga.historial.map(
                  (tunel) =>
                    !tunel["platun"]["denom"].includes("PLACA") && (
                      <tr
                        key={uuidv4()}
                        className="uppercase border-b-2 border-white hover:bg-gray-400"
                      >
                        <td className="text-center py-2">
                          {tunel["proceso"] == "1" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleUp}
                              className="text-green-500"
                              size="lg"
                            />
                          ) : tunel["proceso"] == "3" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleDown}
                              className="text-red-500"
                              size="lg"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faAsterisk}
                              className="text-blue-400"
                              size="lg"
                            />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {tunel["platun"]["denom"]}
                        </td>
                        <td className="text-center py-2">
                          {tunel["proceso_txt"]}
                        </td>
                        <td className="text-center py-2">{tunel["hora"]}</td>
                        <td className="text-right py-2">{tunel["peso"]}</td>
                      </tr>
                    )
                )}

              {carga.hasOwnProperty("ult") &&
                carga.ult.map(
                  (tunel) =>
                    !tunel["item"].includes("PLACA") && (
                      <tr
                        key={uuidv4()}
                        className="uppercase border-b-2 border-white bg-gray-600 hover:bg-gray-400"
                      >
                        <td className="text-center py-2">
                          {tunel["proceso"] == "Start" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleUp}
                              className="text-green-500"
                              size="lg"
                            />
                          ) : tunel["proceso"] == "Stop" ? (
                            <FontAwesomeIcon
                              icon={faArrowAltCircleDown}
                              className="text-red-500"
                              size="lg"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faAsterisk}
                              className="text-blue-400"
                              size="lg"
                            />
                          )}
                        </td>
                        <td className="text-center py-2">{tunel["item"]}</td>
                        <td className="text-center py-2">{tunel["proceso"]}</td>
                        <td className="text-center py-2">{tunel["hora"]}</td>
                        <td className="text-right py-2">{tunel["peso"]}</td>
                      </tr>
                    )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
