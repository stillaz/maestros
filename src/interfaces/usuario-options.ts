import { PerfilOptions } from "./perfil-options";

export interface UsuarioOptions{
    id: number,
    nombre: string,
    telefono: string,
    email: string,
    clave: string,
    perfiles: PerfilOptions[],
    imagen: string,
    googleUser: boolean,
    activo: boolean
}