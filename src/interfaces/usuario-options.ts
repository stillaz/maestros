import { PerfilOptions } from "./perfil-options";
import { ConfiguracionOptions } from "./configuracion-options";

export interface UsuarioOptions{
    id: string,
    nombre: string,
    telefono: string,
    email: string,
    perfiles: PerfilOptions[],
    imagen: string,
    activo: boolean,
    idempresa: string,
    configuracion: ConfiguracionOptions
}