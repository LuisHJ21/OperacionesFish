import { faSignInAlt, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/img/logo.png";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { authStore } from "../stores/loginStore";
import { useNavigate } from "react-router-dom";
import { auth } from "../types";
import ErrorValid from "../components/ErrorValid";
import { axiosClient } from "../services/axios";

type Login = {
  username: string;
  pass: string;
};

export default function LoginVIew() {
  // const urlApi = import.meta.env.VITE_API_URL;
  // const baseUrl = import.meta.env.VITE_BASE_URL;

  const [errorLogin, setErrorLogin] = useState({
    error: "",
  });

  const [stateLogin, setStateLogim] = useState(false);

  const login = authStore((state) => state.login);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Login>();

  const searchOp = async (datos: auth) => {
    const url = `/api/operaciones/search`;
    try {
      const peticion = await axiosClient.post(url, {
        turno: datos["turno"],
        fecha: datos["fecha"],
        username: datos["username"],
      });

      const { data } = peticion.data;
      console.log(data);
      return data["id"];
    } catch (error) {
      console.log(error);
    }
  };

  const enviarLogin = async (datos: Login) => {
    setStateLogim(true);
    setErrorLogin({ error: "" });

    const url = `/api/usuarios/login`;
    try {
      const loguear = await axiosClient.post(url, datos);
      const { data } = loguear.data;

      if (
        data["perfil"].trim() === "DEVELOP" ||
        data["perfil"].trim() === "SUPERMNT"
      ) {
        data["codOper"] = "";

        navigate(`/historial/`);
      } else {
        data["codOper"] = await searchOp(data);

        navigate(`/operaciones/`);
      }
      console.log("pre data");
      login(data);
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        const { data } = error.response;
        setErrorLogin(data);
        //console.log();
      } else if (error.request) {
        setErrorLogin({ error: error.message });
      } else {
        setErrorLogin({ error: error });
      }
    } finally {
      reset();
      setStateLogim(false);
    }
  };

  return (
    <div className="w-2/3 mx-auto pt-20">
      <div className="flex xs:flex-col">
        <div className=" w-1/2 xs:w-full ">
          <div className="flex justify-center text-white text-center content-center">
            <div className="w-1/3">
              <img className="w-full" src={logo} alt="Logo_APP" />
            </div>
          </div>
          <div className="text-white font-bold text-2xl w-full text-center uppercase pt-6">
            <h3>Operaciones</h3>
            <h3>de equipos</h3>
          </div>
        </div>
        <div className="w-1/2 xs:w-full ">
          <form onSubmit={handleSubmit(enviarLogin)} autoComplete="off">
            <div className="">
              <label
                htmlFor=""
                className="text-white font-bold uppercase text-xl"
              >
                Usuario
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 rounded-md h-15 p-3"
                placeholder="USUARIO"
                maxLength={6}
                {...register("username", {
                  required: "El usuario es obligatorio",
                  maxLength: {
                    value: 6,
                    message: "El máximo son 6 caracteres",
                  },
                })}
              />
              {errors.username && (
                <ErrorValid
                  message={
                    errors.username.message ? errors.username.message : ""
                  }
                />
              )}
            </div>
            <div className="py-5">
              <label
                htmlFor=""
                className="text-white font-bold uppercase text-xl"
              >
                Contrseña
              </label>
              <input
                type="password"
                className="w-full border-2 border-gray-300 rounded-md h-15 p-3"
                placeholder="******"
                {...register("pass", {
                  required: "la contraseña es obligatoria",
                })}
              />
              {errors.pass && (
                <ErrorValid
                  message={errors.pass.message ? errors.pass.message : ""}
                />
              )}
            </div>
            <div className="">
              <button
                type="submit"
                className="w-full bg-blue-700 py-3 px-4 border-2 border-blue-700 rounded-md text-white text-xl font-bold disabled:bg-blue-800"
                disabled={stateLogin ? true : false}
              >
                <FontAwesomeIcon
                  icon={stateLogin ? faSyncAlt : faSignInAlt}
                  spin={stateLogin && true}
                  className="mr-2"
                />
                INGESAR
              </button>
              {errorLogin.error.length > 0 && (
                <ErrorValid message={errorLogin.error} />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
