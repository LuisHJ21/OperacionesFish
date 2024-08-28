import { useEffect, useState } from "react";
import { authStore } from "../stores/loginStore";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../types/index";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { axiosClient } from "../services/axios";

type dataHistory = {
  mesHisto: string;
  anioHisto: string;
};

export default function HistorialView() {
  // const urlApi = import.meta.env.VITE_API_URL;
  // const baseUrl = import.meta.env.VITE_BASE_URL;
  const auth = authStore((state) => state.auth);
  const editAuth = authStore((state) => state.editAuth);
  const meses = [
    { valor: "01", nombre: "enero" },
    { valor: "02", nombre: "febrero" },
    { valor: "03", nombre: "marzo" },
    { valor: "04", nombre: "abril" },
    { valor: "05", nombre: "mayo" },
    { valor: "06", nombre: "junio" },
    { valor: "07", nombre: "julio" },
    { valor: "08", nombre: "agosto" },
    { valor: "09", nombre: "septiembre" },
    { valor: "10", nombre: "octubre" },
    { valor: "11", nombre: "noviembre" },
    { valor: "12", nombre: "diciembre" },
  ];

  const mesCalendario = moment().month() + 1;

  const anioActual = auth ? auth["fecha"].split("-")[0] : "2024";

  const mesActual = auth ? auth["fecha"].split("-")[1] : "01";

  const [mesSel, getMesSel] = useState(mesActual);

  const [history, getHistory] = useState([]);

  const [search, setSearch] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<dataHistory>();

  const changeMes = (e: React.ChangeEvent<HTMLSelectElement>) => {
    getMesSel(e.target.value);
  };

  const buscarHistorial = async (data: dataHistory) => {
    setSearch(true);
    const url = `/api/historial/${data["mesHisto"]}/${data["anioHisto"]}`;
    try {
      const peticion = await axiosClient(url);
      const { data } = peticion.data;
      //console.log(data);
      getHistory(data);
    } catch (error: any) {
      //console.log(error);
      getHistory([]);
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR AL OBTENER EQUIPOS", { theme: "dark" });
      }
    } finally {
      setSearch(false);
    }
  };

  const cargarRegistro = (id: string) => {
    const dataReg = history.find((reg) => reg["id"] === id);
    //console.log(dataReg);

    const setAuth: auth = {
      username: auth ? auth["username"] : "",
      nombre: dataReg ? dataReg["user"]["NOMBRE"] : "",
      perfil: auth ? auth["perfil"] : "",
      turno: dataReg ? dataReg["turno"] : "",
      fecha: dataReg ? dataReg["fecha"] : "",
      nombreAdm: auth ? auth["nombreAdm"] : "",
      codOper: dataReg ? dataReg["id"] : "",
      hora: auth ? auth["hora"] : "",
    };
    editAuth(setAuth);
    navigate(`/operaciones`);
  };

  const formatoFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const sendForm = async () => {
      try {
        await handleSubmit(buscarHistorial)();
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
      }
    };

    sendForm();
  }, [mesSel]);

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit(buscarHistorial)}>
        <div className="flex px-3 mt-3 gap-4 xs:flex-col">
          <div className="w-1/2 xs:w-full">
            <div className="flex uppercase ">
              <span className="w-24 bg-gray-300 text-black border-2 rounded-l-lg text-center content-center font-bold">
                mes
              </span>
              <select
                className="w-full h-10 px-3 text-lg text-center font-semibold border-2 rounded-r-lg uppercase "
                value={mesSel}
                {...register("mesHisto", {
                  required: "Debe establecer un mes",
                  onChange: changeMes,
                })}
              >
                {meses.map((mes) => (
                  <option
                    key={mes["valor"]}
                    value={mes["valor"]}
                    disabled={
                      parseInt(mes["valor"]) > mesCalendario ? true : false
                    }
                  >
                    {mes["nombre"]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-1/2 xs:w-full">
            <div className="flex uppercase">
              <span className="w-24 bg-gray-300 text-black border-2 rounded-l-lg text-center content-center font-bold">
                año
              </span>
              <input
                type="text"
                className="w-full h-10 px-3 text-lg text-center font-semibold border-2 rounded-r-lg"
                readOnly
                value={anioActual}
                {...register("anioHisto", {
                  required: "Debe establecer un año",
                })}
              />
            </div>
          </div>
        </div>
      </form>

      <div className="mt-3 px-3">
        <table className="w-full text-white uppercase text-center">
          <thead>
            <tr className="bg-gray-600 border-b-4 border-white font-bold">
              <th className="py-2">Registro</th>
              <th className="py-2">Fecha</th>
              <th className="py-2">Turno</th>
              <th className="py-2">Usuario</th>
              <th className="py-2 xs:hidden">Fec. Registro</th>
            </tr>
          </thead>
          <tbody>
            {search ? (
              <tr className="border-b-2 border-white  font-semibold ">
                <td colSpan={5} className="py-2">
                  BUSCANDO...
                </td>
              </tr>
            ) : history.length > 0 ? (
              history.map((reg) => (
                <tr
                  key={reg["id"]}
                  className="border-b-2 border-white hover:bg-gray-400 font-semibold hover:cursor-pointer"
                  onClick={() => cargarRegistro(reg["id"])}
                >
                  <td className="py-2">{reg["id"]}</td>
                  <td className="py-2">{formatoFecha(reg["fecha"])}</td>
                  <td className="py-2">
                    {reg["turno"] == "1" ? (
                      <FontAwesomeIcon icon={faSun} size="lg" />
                    ) : (
                      <FontAwesomeIcon icon={faMoon} size="lg" />
                    )}
                  </td>
                  <td className="py-2">{reg["user"]["NOMBRE"]}</td>
                  <td className="py-2 xs:hidden">{reg["fecha_reg"]}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b-2 border-white  font-semibold ">
                <td colSpan={5} className="py-2">
                  NO SE HAN ENCONTRADO REGISTROS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
