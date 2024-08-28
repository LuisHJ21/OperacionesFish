import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { newLectura } from "../types";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authStore } from "../stores/loginStore";
import { saveStore } from "../stores/saveStore";
import ErrorValid from "../components/ErrorValid";
import { axiosClient } from "../services/axios";

export default function MedidoresView() {
  // const urlApi = import.meta.env.VITE_API_URL;

  const { auth } = authStore();
  const submitForm = saveStore((state) => state.btnSubmit);
  const resetForm = saveStore((state) => state.reset);

  const [history, getHistory] = useState([]);
  const [ubicaciones, getUbicacion] = useState([]);

  const [ubicDato, getUbicDato] = useState("");
  const [ultDato, getUltDato] = useState(0.0);

  const {
    register,
    reset,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
  } = useForm<newLectura>();

  const getHistorial = async () => {
    const url = `/api/medidores/historial`;
    try {
      const peticion = await axiosClient.post(url, {
        turno: auth ? auth["turno"] : "",
        fecha: auth ? auth["fecha"] : "",
      });
      const { data } = peticion.data;
      getHistory(data);
    } catch (error: any) {
      //console.log(error);
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

  const getUbicaciones = async () => {
    const url = `/api/medidores/ubicaciones`;
    try {
      const peticion = await axiosClient(url);
      const { data } = peticion.data;
      getUbicacion(data);
    } catch (error: any) {
      //console.log(error);
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR AL OBTENER UBICACIONES", { theme: "dark" });
      }
    }
  };

  const changeUlDat = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const select = e.target.value;

    if (select.trim() == "") return;

    getUbicDato(select);

    const url = `/api/medidores/${select}`;
    try {
      const peticion = await axiosClient.get(url);
      const { data } = peticion.data;
      getUltDato(data["ultdato"]);
      reset({
        newLectura: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const enviarFormulario = async (datos: newLectura) => {
    const url = `/api/medidores`;

    try {
      const peticion = await axiosClient.post(url, {
        cod: datos["cod"],
        newLectura: datos["newLectura"],
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
      toast.error("ERROR AL GUARDAR LECTURA", {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      resetForm();
      reset();
      getHistorial();
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
    getHistorial();
    getUbicaciones();
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit((data) => enviarFormulario(data))}>
        <div className="flex wrap pt-3 px-6 gap-4 xs:flex-col">
          <ToastContainer />
          <div className="md: w-1/3 xs:w-full">
            <span className="uppercase font-bold text-white">Ubicación</span>
            <select
              className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg text-lg uppercase text-center"
              value={ubicDato}
              {...register("cod", {
                required: "Debe seleccion ubicacion",
                onChange: changeUlDat,
                value: ubicDato,
              })}
            >
              <option value="">Seleccione</option>
              {ubicaciones.map((ubic) => (
                <option key={ubic["cod"]} value={ubic["cod"]}>
                  {ubic["denom"]}
                </option>
              ))}
            </select>
            {errors.cod && (
              <ErrorValid
                message={errors.cod.message ? errors.cod.message : ""}
              />
            )}
          </div>
          <div className="md: w-1/3 xs:w-full">
            <span className="uppercase font-bold text-white">
              Última Lectura
            </span>
            <input
              className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-gray-500 text-right  text-lg"
              type="number"
              readOnly
              value={ultDato}
              step="any"
            />
          </div>
          <div className="md: w-1/3 xs:w-full">
            <span className="uppercase font-bold text-white">
              Nueva Lectura
            </span>
            <input
              className="border-2 w-full border-gray-300 bg-white h-10 px-3  rounded-lg  focus:outline-none focus:border-gray-500 text-right text-lg font-semibold"
              type="number"
              step="any"
              {...register("newLectura", {
                required: "Debe ingresar el nuevo valor",
                min: {
                  value: ultDato,
                  message: "No puede ser menor a la lectura actual",
                },
              })}
            />
            {errors.newLectura && (
              <ErrorValid
                message={
                  errors.newLectura.message ? errors.newLectura.message : ""
                }
              />
            )}
          </div>
        </div>
        <button className="hidden" id="btnSubmit" type="submit">
          prueba
        </button>
      </form>

      <div className="w-full pt-4 px-6 overflow-scroll">
        <table className="w-full text-white">
          <thead className="">
            <tr className="bg-gray-600 uppercase border-b-4 border-white">
              <th className="py-2">Medidor</th>
              <th className="py-2">Hora Anterior</th>
              <th className="py-2">Lectura Anterior</th>
              <th className="py-2">Ultimo Hora</th>
              <th className="py-2">Ultima Lectura</th>
              <th className="py-2">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 &&
              history.map((registro) => (
                <tr
                  key={registro["cod"]}
                  className="border-b-2 border-white hover:bg-gray-400"
                >
                  <td className="py-1.5 text-left">{registro["descrip"]}</td>
                  <td className="py-1.5 text-center">{registro["anthora"]}</td>
                  <td className="py-1.5 text-right">{registro["antdato"]}</td>
                  <td className="py-1.5 text-center">{registro["ulthora"]}</td>
                  <td className="py-1.5 text-right">{registro["ultdato"]}</td>
                  <td className="py-1.5 text-right">
                    {registro["diferencia"]}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
