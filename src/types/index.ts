export type auth = {
  username: string;
  nombre: string;
  perfil: string;
  turno: string;
  fecha: string;
  nombreAdm: string;
  codOper: string;
  hora: string;
};

export type equipos = {
  cod_maq: string;
  denom: string;
};

export type equipo = {
  cod_maq: string;
  denom: string;
  flag_estado: string;
  num_comp: number;
  num_ord: number;
  nom_corto: string;
  num_horom: string | null;
};

// TYPES PARA GUARDAR
export type newLectura = {
  cod: string;
  newLectura: string;
};

export type newObs = {
  equipo: string;
  obs: string;
};

export type newCarga = {
  item: string;
  proceso: string;
  peso: number;
  obs: string;
};

export type newOperacion = {
  id: string;
  equipo: string;
  horom: string;
  compres: string;
  presAlta: string;
  presBaja: string;
  amperaje: string;
  aceiptePres: string;
  aceiteNvl: string;
  ambienteTemp: string;
  aceiteTemp: string;
  ambienteTemp1: string;
  aceiteTemp1: string;
  obs: string;
};
