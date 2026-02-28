import { api } from '../Enviroments/enviroment'

export const obtenerJugadoresService = async () => {
    const response = await api.get('/jugadores')
    return response.data
}

export const obtenerJugadorPorIdService = async (id) => {
    const response = await api.get(`/jugadores/${id}`)
    return response.data
}

export const crearJugadorService = async (datosJugador) => {
    const response = await api.post('/jugadores', datosJugador)
    return response.data
}

export const actualizarJugadorService = async (id, datosJugador) => {
    const response = await api.put(`/jugadores/${id}`, datosJugador)
    return response.data
}

export const eliminarJugadorService = async (id) => {
    const response = await api.delete(`/jugadores/${id}`)
    return response.data
}

export const obtenerJugadoresPorEquipoService = async (idEquipo) => {
    const response = await api.get(`/jugadores/equipo/${idEquipo}`)
    return response.data
}

export const obtenerEstadisticasJugadorService = async (idJugador) => {
    const response = await api.get(`/jugadores/${idJugador}/estadisticas`)
    return response.data
}

export const verificarSancionService = async (idJugador) => {
    const response = await api.get(`/jugadores/${idJugador}/sancion`)
    return response.data
}