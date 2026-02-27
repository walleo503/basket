// src/services/usuarioService.js
import { api } from '../Enviroments/enviroment'


export const loginService = async (correo, contrasena) => {
    const response = await api.post('/usuarios/login', { correo, contrasena })
    return response.data
}
export const obtenerUsuariosService = async () => {
    const response = await api.get('/usuarios')
    return response.data
}

export const crearUsuarioService = async (datosUsuario) => {
    const response = await api.post('/usuarios', datosUsuario)
    return response.data
}