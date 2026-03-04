import { api } from '../Enviroments/enviroment'

export const obtenerCanchasService = async () => {
    const response = await api.get('/canchas')
    return response.data
}

export const crearCanchaService = async (datosCancha) => {
    const response = await api.post('/canchas', datosCancha)
    return response.data
}