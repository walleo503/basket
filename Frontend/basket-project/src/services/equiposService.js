import { api } from '../Enviroments/enviroment'

export const obtenerEquiposService = async () => {
    const response = await api.get('/equipos')
    return response.data
}

export const obtenerEquipoDeEntrenadorService = async (idEntrenador) => {
    const response = await api.get(`/equipos/entrenador/${idEntrenador}`)
    return response.data
}

// ✅ ESTE ES EL QUE USAS EN obtenerTodosLosEquipos
export const obtenerEquiposPorEntrenadorService = async (idEntrenador) => {
    const response = await api.get(`/equipos/entrenador/${idEntrenador}/todos`)
    return response.data
}

// ✅ CAMBIA EL NOMBRE a crearEquipoService (sin la "s" al final)
export const crearEquipoService = async (equipoData) => {
    const response = await api.post('/equipos', equipoData)
    return response.data
}

// ✅ CAMBIA EL NOMBRE a actualizarEquipoService
export const actualizarEquipoService = async (id, equipoData) => {
    const response = await api.put(`/equipos/${id}`, equipoData)
    return response.data
}

export const cambiarEstadoEquipoService = async (id, activo) => {
    const endpoint = activo ? 'habilitar' : 'deshabilitar'
    const response = await api.patch(`/equipos/${id}/${endpoint}`)
    return response.data
}