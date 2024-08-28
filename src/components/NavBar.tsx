import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { authStore } from "../stores/loginStore";
import { saveStore } from "../stores/saveStore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCaretDown,
  faMoon,
  faSave,
  faSignInAlt,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendarDay } from "@fortawesome/free-solid-svg-icons/faCalendarDay";

export default function NavBar() {
  const [hover, setHover] = useState(false);
  // const baseUrl = import.meta.env.VITE_BASE_URL;

  const mostrarViews = () => {
    setHover(!hover);
  };
  const { pathname } = useLocation();
  const pathSplit = pathname.split("/");

  let actPage = "";
  if (pathSplit.length == 2) {
    actPage = pathSplit[1];
  } else {
    actPage = pathSplit[2];
  }

  const paginaActiva = () => {
    setHover(false);
  };

  const { logout, auth } = authStore();
  const { submit, btnSubmit } = saveStore();
  const navigate = useNavigate();

  const [textSave, setTextSave] = useState("Guardar");

  const cerrarSesion = () => {
    logout();
    navigate(`/`);
  };

  const formatoFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-");

    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    /* console.log(btnSubmit); */
    if (btnSubmit) {
      setTextSave("Guardando...");
    } else {
      setTextSave("Guardar");
    }
  }, [btnSubmit]);

  return (
    <nav className="bg-gray-600 py-2 px-5">
      <div className="w-full flex justify-between xs:flex-col xs:justify-start xs:gap-3">
        <div className="w-2/5 flex wrap text-gray-300 font-extrabold  xs:w-full">
          <div className="grow content-center ">
            <FontAwesomeIcon icon={faUser} className="pe-2" size="xl" />
            <span className="uppercase">
              {actPage == "historial"
                ? auth && auth["nombreAdm"]
                : auth && auth["nombre"]}
            </span>
          </div>
          {auth &&
            (auth["perfil"].trim() === "OPERAMNT" ||
              (auth["nombre"] != auth["nombreAdm"] &&
                actPage != "historial")) && (
              <>
                <div className="px-3 content-center">
                  TURNO{" "}
                  {auth && auth["turno"] == "1" ? (
                    <FontAwesomeIcon icon={faSun} size="xl" className="ps-2" />
                  ) : (
                    <FontAwesomeIcon icon={faMoon} size="xl" className="ps-2" />
                  )}
                </div>
                <div className="px-3 content-center">
                  <span>
                    <FontAwesomeIcon
                      icon={faCalendarDay}
                      className="pe-2"
                      size="xl"
                    />{" "}
                    {auth && formatoFecha(auth["fecha"])}
                  </span>
                </div>
              </>
            )}
        </div>
        <div className="w-2/5 flex flex-wrap uppercase justify-end xs:w-full">
          {auth &&
            (auth["perfil"].trim() === "OPERAMNT" ||
              (auth["nombre"] != auth["nombreAdm"] &&
                actPage != "historial")) && (
              <>
                <div className=" grow">
                  <div
                    className="hover:cursor-pointer relative w-full text-black font-bold text-center bg-gray-400  py-2 after:[content:'']"
                    onClick={mostrarViews}
                  >
                    {actPage == "medidores" ? "Lectura medidor" : actPage}{" "}
                    <FontAwesomeIcon icon={faCaretDown} className="ms-3" />
                  </div>

                  <ul
                    className={
                      hover
                        ? "font-bold text-center w-80 mt-2 block  mr-2 absolute bg-white z-10"
                        : "hidden"
                    }
                  >
                    <li
                      onClick={() => paginaActiva()}
                      className="hover: cursor-pointer hover:bg-gray-300"
                    >
                      <NavLink className="block px-2 py-1" to={`/operaciones`}>
                        Operaciones
                      </NavLink>
                    </li>
                    <li
                      onClick={() => paginaActiva()}
                      className="hover: cursor-pointer hover:bg-gray-300 "
                    >
                      <NavLink className="block px-2 py-1" to={`/carga`}>
                        Carga
                      </NavLink>
                    </li>
                    <li
                      onClick={() => paginaActiva()}
                      className="hover: cursor-pointer hover:bg-gray-300  "
                    >
                      <NavLink className="block px-2 py-1" to={`/medidores`}>
                        Lectura Medidor
                      </NavLink>
                    </li>
                    <li
                      onClick={() => paginaActiva()}
                      className="hover: cursor-pointer hover:bg-gray-300  "
                    >
                      <NavLink
                        className="block px-2 py-1"
                        to={`/observaciones`}
                      >
                        Observaciones
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div className=" w-40 ">
                  {auth && auth.nombreAdm === "" ? (
                    <button
                      type="button"
                      className="w-full text-white font-bold bg-green-600 px-3 py-2 hover:bg-green-800 uppercase disabled:bg-green-700"
                      onClick={submit}
                      disabled={btnSubmit ? true : false}
                    >
                      <FontAwesomeIcon icon={faSave} className="pe-2" />{" "}
                      {textSave}
                    </button>
                  ) : (
                    <button className="w-full text-white font-bold bg-green-600  hover:bg-green-800 uppercase">
                      <NavLink className="block  px-3 py-2" to={`/historial`}>
                        <FontAwesomeIcon icon={faBook} className="pe-2" />{" "}
                        historial
                      </NavLink>
                    </button>
                  )}
                </div>
              </>
            )}

          <div className=" w-40 xs:grow">
            <button
              onClick={cerrarSesion}
              className="w-full text-white font-bold bg-red-600 px-3 py-2 hover:bg-red-800 uppercase "
            >
              Salir <FontAwesomeIcon className="ps-2" icon={faSignInAlt} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
