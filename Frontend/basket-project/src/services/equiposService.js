// src/services/equiposService.js
// src/services/equiposService.js
import { api } from '../Enviroments/enviroment'

export const obtenerEquiposService = async () => {
    const response = await api.get('/equipos')
    return response.data
}

export const crearEquipoService = async (equipoData) => {
    const response = await api.post('/equipos', equipoData)
    return response.data
}

export const obtenerEquipoDeEntrenadorService = async (idEntrenador) => {
    const response = await api.get(`/equipos/entrenador/${idEntrenador}`)
    return response.data
}