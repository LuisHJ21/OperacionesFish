import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import SelEquipos from "../components/SelEquipos";
import { authStore } from "../stores/loginStore";
import { saveStore } from "../stores/saveStore";
import { useForm } from "react-hook-form";
import { equipo, newOperacion } from "../types";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorValid from "../components/ErrorValid";
import { axiosClient } from "../services/axios";

type listComp = {
  value: string;
  text: string;
};

export default function OperacionesView() {
  // const urlApi = import.meta.env.VITE_API_URL;

  const [oper, getOper] = useState({
    oper: [],
    ultoper: [],
  });

  const [equipoSel, getEquipoSel] = useState<equipo>({
    cod_maq: "",
    denom: "",
    flag_estado: "",
    num_comp: 0,
    num_ord: 0,
    nom_corto: "",
    num_horom: "",
  });
  const [compresores, setCompresores] = useState<listComp[]>([]);
  const [selComp, setSelCom] = useState("");
  const [dispambiente1, setDispAmbiente1] = useState(false);
  const [horomAnt, setHoromAnt] = useState("");
  const [horomAct, setHoromAct] = useState("");
  const [ambiente, setAmbiente] = useState("EQUIPO 1");
  const [ambiente1, setAmbiente1] = useState("EQUIPO 2");

  const { auth } = authStore();
  const submitForm = saveStore((state) => state.btnSubmit);
  const resetForm = saveStore((state) => state.reset);

  const {
    register,
    reset,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
  } = useForm<newOperacion>();

  const seleccionarEquipo = (data: equipo) => {
    getEquipoSel(data);
  };

  const seleccionarComp = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelCom(e.target.value);
  };

  const obtenerCompress = () => {
    if (equipoSel === undefined) return;
    const listComp = [];

    const maquina = equipoSel["cod_maq"];
    if (maquina === "01010900") {
      listComp.push({ value: "K1", text: "Piston Mycom" });
      listComp.push({ value: "K2", text: "Tornillo Yantai" });
    } else if (
      maquina == "01014700" ||
      maquina == "01015400" ||
      maquina == "01011000"
    ) {
      listComp.push({ value: "K1", text: "Tornillo 1" });
      listComp.push({ value: "K2", text: "Tornillo 2" });
    } else if (maquina === "01014300") {
      listComp.push({ value: "K1", text: "Piston 1" });
      listComp.push({ value: "K2", text: "Piston 2" });
    } else {
      const numComp = equipoSel["num_comp"];

      for (let index = 1; index <= numComp; index++) {
        listComp.push({ value: `K${index}`, text: `K${index}` });
      }
    }

    setCompresores(listComp);
  };
  const setUltHorom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoromAct(e.target.value);
  };

  const obtenerOper = async () => {
    const url = `/api/operaciones/historial`;
    try {
      const peticion = await axiosClient.post(url, {
        turno: auth ? auth["turno"] : "",
        fecha: auth ? auth["fecha"] : "",
      });

      const { data } = peticion.data;
      getOper(data);
      // console.log(data);
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

  const obtenerHorometro = async () => {
    setHoromAnt("");
    setHoromAct("");
    // const urlApi = import.meta.env.VITE_API_URL;

    try {
      const url = `/api/operaciones/horometro/${auth && auth["codOper"]}/${
        equipoSel["cod_maq"]
      }/${selComp}`;

      const peticion = await axiosClient.get(url);

      const { data } = peticion.data;
      // console.log(data);

      setHoromAnt(data[0]["HOROMETRO"].split(",")[0]);
      setHoromAct(data[0]["HOROMETRO"].split(",")[1]);

      /*  const horom: HTMLElement | null = document.getElementById("horom");
      horom?.focus(); */
    } catch (error: any) {
      if (error.response) {
        const { data } = error.response;
        toast.error(data, { theme: "dark" });
      } else if (error.request) {
        toast.error(error.message, { theme: "dark" });
      } else {
        toast.error("ERROR OBTENER HOROMETRO", { theme: "dark" });
      }
    }
  };

  const enviarFormulario = async (datos: newOperacion) => {
    const url = `/api/operaciones`;
    console.log(datos);

    try {
      datos["id"] = auth ? auth["codOper"] : "";
      const peticion = await axiosClient.post(url, datos);

      const { data } = peticion.data;

      toast.success(data, {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      toast.error("ERROR AL GUARDAR OPERACION", {
        position: "top-right",
        autoClose: 2500,
        closeOnClick: true,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      resetForm();
      reset();
      obtenerOper();
    }
  };

  useEffect(() => {
    if (submitForm) {
      const btn: HTMLElement | null = document.querySelector("#btnSubmit");

      btn?.click();
    }
  }, [submitForm]);

  useEffect(() => {
    obtenerOper();
  }, []);

  useEffect(() => {
    obtenerCompress();
  }, [equipoSel]);

  useEffect(() => {
    // Después de que compresores se actualice, selecciona automáticamente el primer elemento
    if (compresores.length > 0) {
      setSelCom(compresores[0]["value"]);
    }
  }, [compresores]);

  useEffect(() => {
    if (!equipoSel["cod_maq"] || equipoSel["cod_maq"] == "") {
      setHoromAnt("");
      setHoromAct("");
      return;
    }
    if (selComp === "") return;
    obtenerHorometro();
  }, [selComp, compresores]);

  useEffect(() => {
    const maquina = equipoSel["cod_maq"];

    if (maquina === "01010900") {
      setDispAmbiente1(true);
      setAmbiente("camara 1");
      setAmbiente1("camara 2");
    } else if (maquina === "01014700") {
      setDispAmbiente1(true);
      setAmbiente("camara 3");
      setAmbiente1("camara 4");
    } else {
      setDispAmbiente1(false);
      setAmbiente("equipo 1");
      setAmbiente1("equipo 2");
    }

    reset();
  }, [equipoSel]);

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
      <ToastContainer />
      <form onSubmit={handleSubmit(enviarFormulario)} autoComplete="off">
        <div className="flex wrap pt-3 px-6 gap-4 xs:flex-col">
          <div className="w-1/2 mt-2 xs:w-full">
            <div className="">
              <SelEquipos
                seleccionarEquipo={seleccionarEquipo}
                equipoSel={equipoSel}
                register={register}
              />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="w-1/2">
                <label className="text-white font-bold uppercase" htmlFor="">
                  Compresor
                </label>
                <select
                  className="w-full border-2 border-gray-300 h-10 px-3 rounded-lg uppercase font-semibold text-center"
                  value={selComp}
                  {...register("compres", {
                    required: "SELECCIONE COMPRESOR",
                    onChange: seleccionarComp,
                  })}
                >
                  {compresores.length > 0 &&
                    compresores.map((comp) => (
                      <option key={uuidv4()} value={comp["value"]}>
                        {comp["text"]}
                      </option>
                    ))}
                </select>
                {errors.compres && (
                  <ErrorValid
                    message={
                      errors.compres.message ? errors.compres.message : ""
                    }
                  />
                )}
              </div>
              <div className="w-1/2">
                <label className="text-white font-bold uppercase" htmlFor="">
                  Amperaje
                </label>
                <div className="flex w-full">
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 h-10 px-3 rounded-l-lg text-right"
                    {...register("amperaje")}
                  />
                  <span className="w-20 text-center content-center  px-3 text-lg text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold ">
                    A
                  </span>
                </div>
              </div>
            </div>
            <div className="flex wrap gap-4 my-2 xs:flex-col">
              <div className="w-1/3 content-center text-center  border-r-2 xs:border-b-2 xs:border-r-0 border-gray-300 py-2 xs:w-full ">
                <span className=" text-white font-bold uppercase">
                  Horómetro
                </span>
              </div>
              <div className="w-2/3 flex gap-4 xs:w-full">
                <div className="w-1/2">
                  <label className="text-white font-bold uppercase " htmlFor="">
                    Turno Anterior
                  </label>
                  <input
                    type="number"
                    className="border-2 border-gray-300 h-10 px-3 w-full rounded-lg text-right"
                    step="any"
                    readOnly
                    value={horomAnt}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-white font-bold uppercase" htmlFor="">
                    turno actual
                  </label>
                  <input
                    type="number"
                    className="border-2 border-gray-300 h-10 px-3 w-full rounded-lg text-right"
                    step="any"
                    // readOnly={parseInt(horomAct) > 0 ? true : false}
                    value={horomAct}
                    {...register("horom", {
                      required: "INGRESE VALOR",
                      onChange: setUltHorom,
                      min: {
                        value: horomAnt,
                        message: "DEBE SER MAYOR",
                      },
                    })}
                  />
                  {errors.horom && (
                    <ErrorValid
                      message={errors.horom.message ? errors.horom.message : ""}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="" className="text-white font-bold uppercase">
                observaciones
              </label>

              <textarea
                className="w-full border-2 border-gray-300 bg-white px-3 py-1 rounded-lg text-sm uppercase"
                rows={8}
                {...register("obs")}
              ></textarea>
            </div>
          </div>
          <div className="w-1/2 xs:w-full">
            <div className="flex border-2 border-gray-300 mt-2 p-3 xs:flex-col">
              <div className="flex flex-col gap-3 w-1/2 border-r-2 border-gray-300 pe-3 xs:border-none xs:pe-0 xs:w-full">
                <span className="text-white font-bold uppercase text-center">
                  presión
                </span>

                <div className="flex w-full">
                  <label
                    className="text-white font-bold uppercase w-28 content-center"
                    htmlFor=""
                  >
                    alta
                  </label>
                  <div className="flex w-full ps-3">
                    <input
                      type="number"
                      className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                      step="any"
                      {...register("presAlta", {
                        required: "INGRESE P.ALTA",
                        /* min: {
                          value: 0,
                          message: "VALOR MINIMO ES 0",
                        }, */
                      })}
                    />
                    <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                      Lb
                    </span>
                  </div>
                </div>
                {errors.presAlta && (
                  <ErrorValid
                    message={
                      errors.presAlta.message ? errors.presAlta.message : ""
                    }
                  />
                )}
                <div className="flex w-full">
                  <label
                    className="text-white font-bold uppercase w-28 content-center"
                    htmlFor=""
                  >
                    baja
                  </label>
                  <div className="flex w-full ps-3">
                    <input
                      type="number"
                      className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                      step="any"
                      {...register("presBaja", {
                        required: "INGRESE P.BAJA",
                        /*  min: {
                          value: 0,
                          message: "VALOR MINIMO ES 0",
                        }, */
                      })}
                    />
                    <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                      Lb
                    </span>
                  </div>
                </div>
                {errors.presBaja && (
                  <ErrorValid
                    message={
                      errors.presBaja.message ? errors.presBaja.message : ""
                    }
                  />
                )}
              </div>
              <div className="flex flex-col gap-3 w-1/2  ps-3 xs:ps-0 xs:w-full xs:mt-3">
                <span className="text-white font-bold uppercase text-center">
                  aceite
                </span>
                <div className="flex w-full">
                  <label
                    className="text-white font-bold uppercase w-28 content-center"
                    htmlFor=""
                  >
                    presión
                  </label>
                  <div className="flex w-full ps-3">
                    <input
                      type="number"
                      className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                      step="any"
                      {...register("aceiptePres", {
                        required: "INGRESE P.ACEITE",
                        /* min: {
                          value: 0,
                          message: "VALOR MINIMO ES 0",
                        }, */
                      })}
                    />
                    <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                      Lb
                    </span>
                  </div>
                </div>
                {errors.aceiptePres && (
                  <ErrorValid
                    message={
                      errors.aceiptePres.message
                        ? errors.aceiptePres.message
                        : ""
                    }
                  />
                )}
                <div className="flex w-full">
                  <label
                    className="text-white font-bold uppercase w-28 content-center"
                    htmlFor=""
                  >
                    nivel
                  </label>
                  <div className="flex w-full ps-3">
                    <select
                      className="border-2 border-gray-300 rounded-lg h-10 px-3 w-full text-center"
                      {...register("aceiteNvl", {
                        required: "SELECCIONE NIVEL",
                      })}
                    >
                      <option value=""></option>
                      <option value="3/4">3/4</option>
                      <option value="1/2">1/2</option>
                      <option value="1/4">1/4</option>
                    </select>
                  </div>
                </div>
                {errors.aceiteNvl && (
                  <ErrorValid
                    message={
                      errors.aceiteNvl.message ? errors.aceiteNvl.message : ""
                    }
                  />
                )}
              </div>
            </div>

            <div className=" border-2 border-gray-300 mt-6 p-3 ">
              <span className="text-white font-bold uppercase text-center w-full block mb-3">
                temperatura
              </span>
              <div className="flex  w-full xs:flex-col">
                <div className="flex w-1/2 flex-col gap-5 pe-3 border-r-2 border-gray-300  xs:border-none xs:pe-0 xs:w-full">
                  <div>
                    <h4 className="text-white uppercase font-bold text-center">
                      {ambiente}
                    </h4>
                  </div>
                  <div className="flex">
                    <label
                      className="text-white font-bold uppercase w-28 content-center"
                      htmlFor=""
                    >
                      ambiente
                    </label>
                    <div className="flex w-full ps-3">
                      <input
                        type="number"
                        step="any"
                        className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                        {...register("ambienteTemp", {})}
                      />
                      <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                        °C
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <label
                      className="text-white font-bold uppercase w-28 content-center"
                      htmlFor=""
                    >
                      aceite
                    </label>
                    <div className="flex w-full ps-3">
                      <input
                        type="number"
                        step="any"
                        className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                        {...register("aceiteTemp", {})}
                      />
                      <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                        °C
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    dispambiente1
                      ? "flex w-1/2 flex-col gap-5 ps-3  xs:ps-0 xs:w-full xs:mt-3"
                      : "flex w-1/2 flex-col gap-5 ps-3 opacity-40 pointer-events-none  xs:ps-0 xs:w-full xs:mt-3"
                  }
                >
                  <div>
                    <h4 className="text-white uppercase font-bold text-center">
                      {ambiente1}
                    </h4>
                  </div>
                  <div className="flex">
                    <label
                      className="text-white font-bold uppercase w-28 content-center"
                      htmlFor=""
                    >
                      ambiente
                    </label>
                    <div className="flex w-full ps-3">
                      <input
                        type="number"
                        className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                        step="any"
                        readOnly={dispambiente1 ? false : true}
                        {...register("ambienteTemp1", {})}
                      />
                      <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                        °C
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <label
                      className="text-white font-bold uppercase w-28 content-center"
                      htmlFor=""
                    >
                      aceite
                    </label>
                    <div className="flex w-full ps-3">
                      <input
                        type="number"
                        step="any"
                        className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                        readOnly={dispambiente1 ? false : true}
                        {...register("aceiteTemp1", {})}
                      />
                      <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                        °C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* AMBIENTE 2 */}

              {/* <div className="flex  w-full justify-end gap-6 pt-3">
                <div className="flex w-1/2">
                  <label
                    className="text-white font-bold uppercase w-24 content-center"
                    htmlFor=""
                  >
                    ambiente
                  </label>
                  <div className="flex w-full ps-3">
                    <input
                      type="text"
                      className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                      {...register("ambienteTemp1", {})}
                    />
                    <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                      °C
                    </span>
                  </div>
                </div>
                <div className="flex w-1/2">
                  <label
                    className="text-white font-bold uppercase w-24 content-center"
                    htmlFor=""
                  >
                    aceite
                  </label>
                  <div className="flex w-full ps-3">
                    <input
                      type="text"
                      className="border-2 border-gray-300 rounded-l-lg h-10 px-3 w-full text-right"
                      {...register("aceiteTemp1", {})}
                    />
                    <span className=" text-center content-center  px-3 text-sm text-gray-600 bg-gray-200 border border-r-0 border-gray-300 rounded-r-lg font-extrabold">
                      °C
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <button className="hidden" id="btnSubmit" type="submit">
          prueba
        </button>
      </form>

      <div className="mt-3 px-6 h-screen overflow-scroll">
        <table className="w-full text-white">
          <thead className="sticky overflow-hidden top-0">
            <tr className=" bg-gray-600 uppercase ">
              <th colSpan={4} className="px-3 ">
                <div className="border-b-4 border-white py-2">
                  <span>historial de registros</span>
                </div>
              </th>
              <th colSpan={2} className="px-3 ">
                <div className="border-b-4 border-white py-2">
                  <span>presión</span>
                </div>
              </th>
              <th colSpan={2} className="px-3 ">
                {" "}
                <div className="border-b-4 border-white py-2">
                  <span>aceite</span>
                </div>
              </th>
              <th colSpan={4} className="px-3 ">
                {" "}
                <div className="border-b-4 border-white py-2">
                  <span>temperatura °C</span>
                </div>
              </th>
            </tr>
            <tr className="uppercase bg-gray-600 border-b-4 border-white ">
              <th className="py-1.5">Hora</th>
              <th className="py-1.5">equipo</th>
              <th className="py-1.5">compresor</th>
              <th className="py-1.5">amperaje (a)</th>
              <th className="py-1.5">alta</th>
              <th className="py-1.5">baja</th>
              <th className="py-1.5">presión</th>
              <th className="py-1.5">nivel</th>
              <th className="py-1.5">ambiente N° 1</th>
              <th className="py-1.5">aceite </th>
              <th className="py-1.5">ambiente N° 2</th>
              <th className="py-1.5">aceite </th>
            </tr>
          </thead>
          <tbody>
            {oper.hasOwnProperty("oper") &&
              oper.oper.map((op) => (
                <tr
                  key={uuidv4()}
                  className="text-center border-b-2 border-white uppercase font-semibold hover:bg-gray-400"
                >
                  <td className="py-2 ">{op["hora"]}</td>
                  <td className="py-2 ">{op["lista"]["DENOM"]}</td>
                  <td className="py-2 ">{op["compresor"]}</td>
                  <td className="py-2 ">{op["amperaje"]}</td>
                  <td className="py-2 ">{op["pres_alta"]}</td>
                  <td className="py-2 ">{op["pres_baja"]}</td>
                  <td className="py-2 ">{op["pres_aceite"]}</td>
                  <td className="py-2 ">{op["nivel_aceite"]}</td>
                  <td className="py-2 ">{op["temp_amb"]}</td>
                  <td className="py-2 ">{op["temp_aceite"]}</td>
                  <td className="py-2 ">{op["temp_amb1"]}</td>
                  <td className="py-2 ">{op["temp_aceite1"]}</td>
                </tr>
              ))}

            {oper.hasOwnProperty("ultoper") &&
              oper.ultoper.map((ultop) => (
                <tr
                  key={uuidv4()}
                  className="text-center border-b-2 border-white uppercase font-semibold bg-gray-600 hover:bg-gray-400"
                >
                  <td className="py-2 ">{ultop["hora"]}</td>
                  <td className="py-2 ">{ultop["maquina"]}</td>
                  <td className="py-2 ">{ultop["compresor"]}</td>
                  <td className="py-2 ">{ultop["amper"]}</td>
                  <td className="py-2 ">{ultop["presa"]}</td>
                  <td className="py-2 ">{ultop["presb"]}</td>
                  <td className="py-2 ">{ultop["presac"]}</td>
                  <td className="py-2 ">{ultop["nivela"]}</td>
                  <td className="py-2 ">{ultop["tempm"]}</td>
                  <td className="py-2 ">{ultop["tempa"]}</td>
                  <td className="py-2 ">{ultop["tempm1"]}</td>
                  <td className="py-2 ">{ultop["tempa1"]}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
