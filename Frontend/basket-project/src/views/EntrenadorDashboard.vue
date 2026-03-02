<template>
    <div>
        <!-- Contenido principal -->
        <div class="min-h-screen bg-gray-50">
            <nav class="bg-white shadow-md">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <div class="shrink-0">
                                <h1 class="text-2xl font-bold text-indigo-600">BasketPro</h1>
                            </div>
                        </div>
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-center space-x-4">
                                <button @click="navigateTo('perfil')"
                                    class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    {{ userName }}
                                </button>
                                <button @click="logout"
                                    class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                
                <Sidebar :activeTab="activeTab" @navigate="navigateTo" />

                <main class="flex-1 overflow-auto">
                    <div class="py-6 px-4 sm:px-6 lg:px-8">
                        
                        <!-- ===================================================== -->
                        <!-- SELECTOR DE EQUIPOS (VISIBLE EN TODAS LAS PESTAÑAS) -->
                        <!-- ===================================================== -->
                        <div v-if="equipos.length > 0" class="mb-6 bg-white rounded-lg shadow-md p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-700">Mis Equipos</h3>
                                <button @click="openCreateTeamModal" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Equipo
                                </button>
                            </div>
                            
                            <div class="flex flex-wrap gap-2">
                                <button v-for="equipo in equipos" :key="equipo.id_equipo"
                                    @click="seleccionarEquipo(equipo.id_equipo)"
                                    class="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2"
                                    :class="[
                                        equipo.id_equipo === equipoActual?.id_equipo 
                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent',
                                        !equipo.activo ? 'opacity-60' : ''
                                    ]">
                                    <span :class="equipo.activo ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></span>
                                    <span>{{ equipo.nombre_oficial }} ({{ equipo.siglas }})</span>
                                    <span v-if="!equipo.activo" class="text-xs bg-gray-300 text-gray-700 px-1 rounded">Inactivo</span>
                                </button>
                            </div>
                        </div>

                        <!-- Sección Equipo -->
                        <div v-if="activeTab === 'equipo'" class="space-y-6">
                            
                            <div v-if="equipos.length > 0" class="space-y-6">
                                <!-- Cabecera del equipo actual -->
                                <div class="flex justify-between items-end">
                                    <div>
                                        <h2 class="text-3xl font-bold text-gray-900">
                                            {{ equipoActual ? equipoActual.nombre_oficial : 'Mi Equipo' }} 
                                            <span class="text-lg text-gray-500 font-normal ml-2">({{ equipoActual?.siglas }})</span>
                                            <span v-if="!equipoActual?.activo" 
                                                class="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                                Inactivo
                                            </span>
                                        </h2>
                                        <p class="mt-2 text-gray-600">
                                            Sede: {{ equipoActual?.direccion_cancha || 'No definida' }} | 
                                            Categoría: <span class="capitalize">{{ equipoActual?.clasificacion || 'General' }}</span>
                                        </p>
                                    </div>
                                    <div class="flex space-x-3">
                                        <button @click="openEditTeamModal(equipoActual)" 
                                            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar Equipo
                                        </button>
                                        <button @click="toggleTeamStatus(equipoActual)" 
                                            :class="[
                                                'px-4 py-2 rounded-md transition-colors shadow-sm flex items-center',
                                                equipoActual?.activo 
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            ]">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path v-if="equipoActual?.activo" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {{ equipoActual?.activo ? 'Deshabilitar' : 'Habilitar' }}
                                        </button>
                                    </div>
                                </div>

                                <!-- Tarjetas de estadísticas -->
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-gray-600 text-sm">Jugadores Activos</p>
                                                <p class="text-3xl font-bold text-gray-900">{{ estadisticas?.jugadores_activos || 0 }}</p>
                                            </div>
                                            <svg class="h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-gray-600 text-sm">Partidos Jugados</p>
                                                <p class="text-3xl font-bold text-gray-900">{{ estadisticas?.partidos_jugados || 0 }}</p>
                                            </div>
                                            <svg class="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.53 3.066 3.066 0 001.835-.79zm12 0a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.53 3.066 3.066 0 001.835-.79zM9 12a3 3 0 11-6 0 3 3 0 016 0zm9 0a3 3 0 11-6 0 3 3 0 016 0zm-13.5 5.5h3v3h-3v-3zm9 0h3v3h-3v-3z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-gray-600 text-sm">Victorias</p>
                                                <p class="text-3xl font-bold text-gray-900">{{ estadisticas?.victorias || 0 }}</p>
                                            </div>
                                            <svg class="h-12 w-12 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <p class="text-gray-600 text-sm">Tasa de Victorias</p>
                                                <p class="text-3xl font-bold text-gray-900">{{ tasaVictorias }}%</p>
                                            </div>
                                            <svg class="h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V9.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 8H12z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <!-- Próximos Partidos -->
                                <div class="bg-white rounded-lg shadow-md p-6">
                                    <h3 class="text-lg font-bold text-gray-900 mb-4">Próximos Partidos</h3>
                                    <p class="text-gray-500 text-center py-8">No hay partidos programados</p>
                                </div>
                            </div>

                            <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-md">
                                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-2">Aún no tienes equipos</h2>
                                <p class="text-gray-600 mb-6 text-center max-w-md">Para empezar a gestionar jugadores, partidos y estadísticas, necesitas registrar tu primer equipo.</p>
                                <button @click="openCreateTeamModal" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                    Registrar Mi Primer Equipo
                                </button>
                            </div>
                        </div>

                        <!-- Sección Jugadores -->
                        <div v-if="activeTab === 'jugadores'" class="space-y-6">
                            <div v-if="equipos.length > 0">
                                <div class="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 class="text-3xl font-bold text-gray-900">Jugadores</h2>
                                        <p class="mt-2 text-gray-600">Gestiona los jugadores de <span class="font-semibold text-indigo-600">{{ equipoActual?.nombre_oficial }}</span></p>
                                    </div>
                                    <button @click="openAddPlayerModal"
                                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        + Agregar Jugador
                                    </button>
                                </div>

                                <!-- Tarjetas de estadísticas de jugadores -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div class="bg-white rounded-lg shadow-md p-4">
                                        <p class="text-gray-600 text-sm">Total Jugadores</p>
                                        <p class="text-2xl font-bold text-gray-900">{{ players.length }}</p>
                                    </div>
                                    <div class="bg-white rounded-lg shadow-md p-4">
                                        <p class="text-gray-600 text-sm">Capitanes</p>
                                        <p class="text-2xl font-bold text-gray-900">{{ players.filter(p => p.es_capitan).length }}</p>
                                    </div>
                                    <div class="bg-white rounded-lg shadow-md p-4">
                                        <p class="text-gray-600 text-sm">Promedio Estatura</p>
                                        <p class="text-2xl font-bold text-gray-900">{{ promedioEstatura.toFixed(2) }}m</p>
                                    </div>
                                </div>

                                <!-- Tabla de jugadores con contracción -->
                                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div class="px-6 py-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer" @click="toggleJugadoresSection">
                                        <h3 class="text-lg font-semibold text-gray-700">Lista de Jugadores</h3>
                                        <svg class="w-5 h-5 text-gray-500 transition-transform" :class="{ 'rotate-180': mostrarJugadores }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    <div v-show="mostrarJugadores">
                                        <div v-if="players.length === 0" class="text-center py-12">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay jugadores en este equipo</h3>
                                            <p class="mt-1 text-sm text-gray-500">Comienza agregando jugadores.</p>
                                        </div>

                                        <table v-else class="min-w-full divide-y divide-gray-200">
                                            <thead class="bg-gray-50">
                                                <tr>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatura</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capitán</th>
                                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white divide-y divide-gray-200">
                                                <tr v-for="player in players" :key="player.id_jugador" class="hover:bg-gray-50">
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        #{{ player.numero_camiseta }}
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-nowrap">
                                                        <div class="text-sm font-medium text-gray-900">{{ player.nombre }} {{ player.apellido }}</div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {{ player.posicion }}
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {{ player.estatura ? player.estatura + 'm' : '-' }}
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span v-if="player.es_capitan" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                            Capitán
                                                        </span>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button @click="editPlayer(player)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                                                            Editar
                                                        </button>
                                                        <button @click="confirmDeletePlayer(player)" class="text-red-600 hover:text-red-900">
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <h3 class="mt-2 text-lg font-medium text-gray-900">Necesitas un equipo primero</h3>
                                <p class="mt-1 text-sm text-gray-500">Crea o selecciona un equipo para gestionar sus jugadores.</p>
                                <button @click="activeTab = 'equipo'" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                    Ir a Equipos
                                </button>
                            </div>
                        </div>

                        <!-- Sección Torneo (sin cambios) -->
                        <div v-if="activeTab === 'torneo'" class="space-y-6">
                            <!-- ... contenido existente de torneo ... -->
                        </div>

                        <!-- Sección Perfil (sin cambios) -->
                        <div v-if="activeTab === 'perfil'" class="space-y-6">
                            <!-- ... contenido existente de perfil ... -->
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Modal para crear/editar equipo -->
        <ModalEditarEquipo
            :show="showTeamModal"
            :equipo="equipoAEditar"
            @close="closeTeamModal"
            @save="saveTeam"
        />

        <!-- Modal Agregar/Editar Jugador -->
        <ModalAgregarJugador 
            :show="showPlayerModal"
            :jugador="selectedPlayer"
            @close="closePlayerModal"
            @save="savePlayer"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import ModalAgregarJugador from '../components/ModalAgregarJugador.vue'
import ModalEditarEquipo from '../components/ModalEditarEquipo.vue'
import { api } from '../Enviroments/enviroment'
import { 
    obtenerEquipoDeEntrenadorService,
    obtenerEquiposPorEntrenadorService,
    crearEquipoService,
    actualizarEquipoService,
    cambiarEstadoEquipoService
} from '../services/equiposService'
import { 
    obtenerJugadoresPorEquipoService, 
    crearJugadorService, 
    actualizarJugadorService, 
    eliminarJugadorService 
} from '../services/jugadoresService'

const router = useRouter()
const activeTab = ref('equipo')
const userName = ref('Entrenador')
const equipos = ref([])
const equipoActual = ref(null)
const estadisticas = ref(null)
const mostrarJugadores = ref(true)

// Variables para jugadores
const players = ref([])
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)

// Variables para modal de equipo
const showTeamModal = ref(false)
const equipoAEditar = ref(null)

// Variables para standings
const standings = ref([])

// Variables para perfil
const profile = ref({
    fullName: '',
    email: '',
    phone: '',
    experience: '0-5 años'
})

// Computed para promedio de estatura
const promedioEstatura = computed(() => {
    const jugadoresConEstatura = players.value.filter(p => p.estatura)
    if (jugadoresConEstatura.length === 0) return 0
    const suma = jugadoresConEstatura.reduce((acc, p) => acc + parseFloat(p.estatura), 0)
    return suma / jugadoresConEstatura.length
})

// Computed para tasa de victorias
const tasaVictorias = computed(() => {
    if (!estadisticas.value || estadisticas.value.partidos_jugados === 0) return 0
    return ((estadisticas.value.victorias / estadisticas.value.partidos_jugados) * 100).toFixed(1)
})

// =====================================================
// MÉTODOS PARA EQUIPOS
// =====================================================
const obtenerTodosLosEquipos = async () => {
    try {
        const idEntrenador = localStorage.getItem('usuario_id')
        // ✅ USAR EL SERVICIO IMPORTADO en lugar de api.get directamente
        const data = await obtenerEquiposPorEntrenadorService(idEntrenador)
        equipos.value = data
        
        if (equipos.value.length > 0) {
            // Seleccionar el primer equipo activo, o el primero si no hay activos
            const activo = equipos.value.find(e => e.activo)
            equipoActual.value = activo || equipos.value[0]
            await cargarDatosEquipoActual()
        } else {
            equipoActual.value = null
        }
    } catch (error) {
        console.error('Error al obtener equipos:', error)
        equipos.value = []
        equipoActual.value = null
    }
}

const seleccionarEquipo = async (idEquipo) => {
    const seleccionado = equipos.value.find(e => e.id_equipo === idEquipo)
    if (seleccionado) {
        equipoActual.value = seleccionado
        await cargarDatosEquipoActual()
    }
}

const cargarDatosEquipoActual = async () => {
    if (equipoActual.value) {
        await Promise.all([
            cargarEstadisticas(),
            cargarJugadores()
        ])
    }
}

const cargarEstadisticas = async () => {
    try {
        const response = await api.get(`/equipos/${equipoActual.value.id_equipo}/estadisticas`)
        estadisticas.value = response.data
    } catch (error) {
        console.error('Error al cargar estadísticas:', error)
    }
}

const openCreateTeamModal = () => {
    console.log('🟢 Abriendo modal crear equipo')
    equipoAEditar.value = null
    showTeamModal.value = true
    console.log('showTeamModal:', showTeamModal.value)
}

const openEditTeamModal = (equipo) => {
    console.log('🟢 Abriendo modal editar equipo', equipo)
    equipoAEditar.value = equipo
    showTeamModal.value = true
    console.log('showTeamModal:', showTeamModal.value)
}
const closeTeamModal = () => {
    showTeamModal.value = false
    equipoAEditar.value = null
}

const saveTeam = async (teamData) => {
    try {
        const idEntrenador = localStorage.getItem('usuario_id')
        
        if (equipoAEditar.value) {
            // Actualizar equipo existente
            await actualizarEquipoService(equipoAEditar.value.id_equipo, teamData)
        } else {
            // Crear nuevo equipo
            await crearEquipoService({
                ...teamData,
                id_entrenador: idEntrenador
            })
        }
        
        await obtenerTodosLosEquipos()
        closeTeamModal()
    } catch (error) {
        console.error('Error al guardar equipo:', error)
        alert('Error al guardar el equipo')
    }
}

const toggleTeamStatus = async (equipo) => {
    try {
        const endpoint = equipo.activo ? 'deshabilitar' : 'habilitar'
        await api.patch(`/equipos/${equipo.id_equipo}/${endpoint}`)
        
        // Actualizar estado en la lista
        equipo.activo = !equipo.activo
        
        const mensaje = equipo.activo 
            ? 'Equipo habilitado correctamente' 
            : 'Equipo deshabilitado correctamente'
        
        alert(mensaje)
    } catch (error) {
        console.error('Error al cambiar estado del equipo:', error)
        alert('Error al cambiar el estado del equipo')
    }
}

// =====================================================
// MÉTODOS PARA JUGADORES
// =====================================================

const openAddPlayerModal = () => {
    selectedPlayer.value = null
    showPlayerModal.value = true
}

const editPlayer = (player) => {
    selectedPlayer.value = player
    showPlayerModal.value = true
}

const closePlayerModal = () => {
    showPlayerModal.value = false
    selectedPlayer.value = null
}

const savePlayer = async (playerData) => {
    try {
        if (selectedPlayer.value) {
            // Actualizar jugador existente
            await actualizarJugadorService(selectedPlayer.value.id_jugador, playerData)
        } else {
            // Crear nuevo jugador
            await crearJugadorService({
                ...playerData,
                id_equipo: equipoActual.value.id_equipo
            })
        }
        await cargarJugadores()
        await cargarEstadisticas()
        closePlayerModal()
    } catch (error) {
        console.error('Error al guardar jugador:', error)
        alert('Error al guardar el jugador')
    }
}

const confirmDeletePlayer = (player) => {
    if (confirm(`¿Estás seguro de eliminar a ${player.nombre} ${player.apellido} del equipo?`)) {
        eliminarJugador(player)
    }
}

const eliminarJugador = async (player) => {
    try {
        await eliminarJugadorService(player.id_jugador, equipoActual.value.id_equipo)
        await cargarJugadores()
        await cargarEstadisticas()
    } catch (error) {
        console.error('Error al eliminar jugador:', error)
        alert('Error al eliminar el jugador')
    }
}

const cargarJugadores = async () => {
    if (equipoActual.value) {
        try {
            const data = await obtenerJugadoresPorEquipoService(equipoActual.value.id_equipo)
            players.value = data
        } catch (error) {
            console.error('Error al cargar jugadores:', error)
        }
    }
}

const toggleJugadoresSection = () => {
    mostrarJugadores.value = !mostrarJugadores.value
}

// =====================================================
// MÉTODOS DE NAVEGACIÓN
// =====================================================

const navigateTo = (tab) => {
    activeTab.value = tab
}

const logout = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('usuario_id')
    router.push('/login')
}

// =====================================================
// LIFECYCLE
// =====================================================
onMounted(async () => {
    await obtenerTodosLosEquipos()
})

// Watcher para cuando cambia el equipo actual
watch(equipoActual, async (nuevoEquipo) => {
    if (nuevoEquipo) {
        await cargarDatosEquipoActual()
    }
})
</script>