import SelEquipos from "../components/SelEquipos";
import { authStore } from "../stores/loginStore";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveStore } from "../stores/saveStore";
import { useForm } from "react-hook-form";
import { equipo, newObs } from "../types";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorValid from "../components/ErrorValid";
import { axiosClient } from "../services/axios";

export default function ObservacionesView() {
  // const urlApi = import.meta.env.VITE_API_URL;

  const [obs, getObs] = useState([]);

  const { auth } = authStore();
  const submitForm = saveStore((state) => state.btnSubmit);
  const resetForm = saveStore((state) => state.reset);

  const [equipoSel, getEquipoSel] = useState<equipo>({
    cod_maq: "",
    denom: "",
    flag_estado: "",
    num_comp: 0,
    num_ord: 0,
    nom_corto: "",
    num_horom: "",
  });

  const {
    register,
    reset,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
  } = useForm<newObs>();

  const seleccionarEquipo = (data: equipo) => {
    getEquipoSel(data);
  };

  const cargarObs = async () => {
    try {
      let url = `/api/obs/historial`;

      const response = await axiosClient.post(url, {
        turno: auth ? auth["turno"] : "",
        fecha: auth ? auth["fecha"] : "",
      });

      const { data } = response.data;
      getObs(data);
      // console.log(data);
    } catch (error: any) {
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR AL CONSULTAR HISTORIAL", { theme: "dark" });
      }
    }
  };

  const enviarFormulario = async (datos: newObs) => {
    const url = `/api/obs`;

    try {
      const peticion = await axiosClient.post(url, {
        equipo: datos["equipo"],
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
      toast.error("ERROR AL GUARDAR OBSERVACION", {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      resetForm();
      reset();
      cargarObs();
    }
  };
  useEffect(() => {
    cargarObs();
  }, []);

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

  return (
    <>
      <div className="flex wrap pt-3 mx-4 xs:flex-col">
        <div className="md: w-2/5 px-2 xs:w-full">
          <ToastContainer />
          <form onSubmit={handleSubmit(enviarFormulario)}>
            <div className="w-full pb-2">
              <label htmlFor="" className="text-white uppercase font-bold">
                Equipo
              </label>
              <SelEquipos
                seleccionarEquipo={seleccionarEquipo}
                equipoSel={equipoSel}
                register={register}
              />
            </div>
            <div className="w-full">
              <label htmlFor="" className="text-white uppercase font-bold">
                Observaciones
              </label>
              <textarea
                className="w-full border-2 border-gray-300 bg-white px-3 py-1 rounded-lg text-sm uppercase"
                rows={10}
                {...register("obs", {
                  required: "DEBE INGRESAR LA OBSERVACIÓN",
                })}
              ></textarea>
              {errors.obs && (
                <ErrorValid
                  message={errors.obs.message ? errors.obs.message : ""}
                />
              )}
            </div>
            <button className="hidden" id="btnSubmit" type="submit">
              prueba
            </button>
          </form>
        </div>
        <div className="md: w-3/5 px-2 xs:w-full">
          <span className="text-white uppercase font-bold">
            Registro de observaciones
          </span>
          {/* <div className=" pb-3">
          <div className="flex">
            <span className="w-20 text-center content-center  px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md ">
              <FontAwesomeIcon icon={faFilter} size="xl" />
            </span>
            <SelEquipos />
          </div>
        </div> */}
          <table className="w-full text-white">
            <thead className="">
              <tr className="bg-gray-600 uppercase border-b-4 border-white">
                <th className="py-2">hora</th>
                <th className="py-2">equipo</th>
                <th className="py-2">observaciones</th>
              </tr>
            </thead>
            <tbody>
              {obs.length > 0 ? (
                obs.map((ob) => (
                  <tr
                    key={uuidv4()}
                    className="border-b-2 border-white hover:bg-gray-400 uppercase"
                  >
                    <td className="py-1.5 text-center">{ob["hora"]}</td>
                    <td className="py-1.5 text-center">
                      {ob["lista"] !== null ? ob["lista"]["DENOM"] : "general"}
                    </td>
                    <td className="py-1.5 text-center">{ob["observa"]}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b-2 border-white">
                  <td
                    colSpan={3}
                    className="py-1.5 text-center uppercase font-semibold"
                  >
                    {" "}
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
