import LoginVIew from "./Views/LoginVIew";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OperacionesView from "./Views/OperacionesView";
import { authStore } from "./stores/loginStore";
import MedidoresView from "./Views/MedidoresView";
import ObservacionesView from "./Views/ObservacionesView";
import Layout from "./layout/Layout";
import CargaView from "./Views/CargaView";
import HistorialView from "./Views/HistorialView";
import moment from "moment";
import NetState from "./components/NetState";
import noWifi from "./assets/img/nowifi.png";
import { useEffect, useState } from "react";
// import NoFound from "./components/NoFound";

function App() {
  const { stateAuth, auth, logout, horaLogin } = authStore();
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (
    auth &&
    auth["perfil"].trim() !== "DEVELOP" &&
    auth["perfil"].trim() !== "SUPERMNT"
  ) {
    const horaAct = moment();
    const ultSesion = moment(`${horaLogin}`, "YYYY-MM-DD HH:mm:ss");
    const diff = horaAct.diff(ultSesion, "minutes");
    console.log(diff);

    if (diff >= 120) {
      logout();
    }
  }

  // const BASEURL = import.meta.env.VITE_BASE_URL;

  return (
    <>
      <div
        className={
          isConnected ? "hidden" : " absolute h-screen w-full opacity-90 z-30 "
        }
      >
        <NetState img={noWifi} />
      </div>

      <BrowserRouter basename="/operacionesv2">
        <Routes>
          <Route
            path={"/"}
            element={
              stateAuth ? (
                auth &&
                (auth["perfil"].trim() === "DEVELOP" ||
                  auth["perfil"].trim() === "SUPERMNT") ? (
                  <Navigate to="/historial" />
                ) : (
                  <Navigate to="/operaciones" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path={"/login"}
            element={stateAuth ? <Navigate to={baseUrl} /> : <LoginVIew />}
          />
          <Route element={<Layout />}>
            <Route
              path={"/operaciones"}
              element={
                stateAuth ? <OperacionesView /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path={"/medidores"}
              element={
                stateAuth ? <MedidoresView /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path={"/carga"}
              element={stateAuth ? <CargaView /> : <Navigate to={"/login"} />}
            />
            <Route
              path={"/observaciones"}
              element={
                stateAuth ? <ObservacionesView /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path={"/historial"}
              element={
                auth &&
                (auth["perfil"].trim() === "DEVELOP" ||
                  auth["perfil"].trim() === "SUPERMNT") ? (
                  <HistorialView />
                ) : (
                  <Navigate to={"/login"} />
                )
              }
            />
          </Route>
          <Route path="/*" element={<Navigate to={"/"} />} />
          {/* <Route path="/operaciones" element={stateAuth?<OperacionesView />:<LoginVIew />}></Route> */}
          {/*   <Route path="*" element={<Navigate to="/operaciones" />} /> */}
        </Routes>
      </BrowserRouter>
    </>

    /*  <LoginVIew /> */
    /* <>
      <NavBar />
      <div className="container-2xl mx-auto  ">
        <ObservacionesView />
      </div>
    </> */
  );
}

export default App;
