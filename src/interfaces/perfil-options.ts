import { ServicioOptions } from "./servicio-options";

export interface PerfilOptions{
    id: string,
    nombre: string,
    imagen: string,
    servicios: ServicioOptions[],
    activo: boolean,
    idempresa: string,
    grupo: string[],
    negocio: string[]
}