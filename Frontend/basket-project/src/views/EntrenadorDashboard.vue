<template>
  <div>
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <h1 class="text-2xl font-bold text-indigo-600">BasketPro</h1>
            <div class="flex items-center space-x-4">
              <span class="text-gray-900 px-3 py-2 text-sm font-medium">{{ userName }}</span>
              <button @click="logout"
                class="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        <Sidebar :activeTab="activeTab" @navigate="navigateTo" />

        <main class="flex-1 overflow-auto">
          <div class="py-6 px-4 sm:px-6 lg:px-8">

            <!-- Selector de equipos -->
            <div v-if="equipos.length > 0" class="mb-6 bg-white rounded-lg shadow-md p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-700">Mis Equipos</h3>
                <button @click="openCreateTeamModal"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
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

            <!-- ======== TAB: EQUIPO ======== -->
            <div v-if="activeTab === 'equipo'" class="space-y-6">
              <div v-if="equipos.length > 0" class="space-y-6">
                <!-- Cabecera equipo -->
                <div class="flex justify-between items-start bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900">
                      {{ equipoActual?.nombre_oficial || 'Mi Equipo' }}
                      <span class="text-lg text-gray-500 font-normal ml-2">({{ equipoActual?.siglas }})</span>
                      <span v-if="!equipoActual?.activo"
                        class="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">Inactivo</span>
                    </h2>
                    <p class="mt-2 text-gray-600">
                      Sede: {{ equipoActual?.direccion_cancha || 'No definida' }} |
                      Categoría: <span class="capitalize">{{ equipoActual?.clasificacion || 'General' }}</span>
                      <span v-if="equipoActual?.nivel" class="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {{ equipoActual.nivel }}
                      </span>
                    </p>
                  </div>
                  <div class="flex space-x-3">
                    <button @click="navigateTo('jugadores')"
                      class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Gestionar Jugadores
                    </button>
                    <button @click="openEditTeamModal(equipoActual)"
                      class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Equipo
                    </button>
                    <button @click="toggleTeamStatus(equipoActual)"
                      :class="[
                        'px-4 py-2 rounded-md shadow-sm font-medium transition-colors',
                        equipoActual?.activo
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                      ]">
                      {{ equipoActual?.activo ? 'Deshabilitar' : 'Habilitar' }}
                    </button>
                  </div>
                </div>

                <!-- Estadísticas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white rounded-lg shadow-md p-6">
                    <p class="text-gray-600 text-sm">Jugadores Activos</p>
                    <p class="text-3xl font-bold text-gray-900">{{ estadisticas?.jugadores_activos || 0 }}</p>
                  </div>
                  <div class="bg-white rounded-lg shadow-md p-6">
                    <p class="text-gray-600 text-sm">Partidos Jugados</p>
                    <p class="text-3xl font-bold text-gray-900">{{ estadisticas?.partidos_jugados || 0 }}</p>
                  </div>
                  <div class="bg-white rounded-lg shadow-md p-6">
                    <p class="text-gray-600 text-sm">Victorias</p>
                    <p class="text-3xl font-bold text-green-600">{{ estadisticas?.victorias || 0 }}</p>
                  </div>
                  <div class="bg-white rounded-lg shadow-md p-6">
                    <p class="text-gray-600 text-sm">Tasa de Victorias</p>
                    <p class="text-3xl font-bold text-gray-900">{{ tasaVictorias }}%</p>
                  </div>
                </div>

                <!-- Próximos partidos -->
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">Próximos Partidos</h3>
                  <p class="text-gray-500 text-center py-8">No hay partidos programados</p>
                </div>
              </div>

              <!-- Sin equipos -->
              <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-md">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Aún no tienes equipos</h2>
                <p class="text-gray-600 mb-6 text-center max-w-md">Registra tu primer equipo para comenzar.</p>
                <button @click="openCreateTeamModal"
                  class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                  Registrar Mi Primer Equipo
                </button>
              </div>
            </div>

            <!-- ======== TAB: JUGADORES ======== -->
            <div v-if="activeTab === 'jugadores'" class="space-y-6">
              <div v-if="equipos.length > 0">
                <div class="flex justify-between items-center mb-4">
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900">Jugadores</h2>
                    <p class="mt-2 text-gray-600">
                      Gestiona los jugadores de
                      <span class="font-semibold text-indigo-600">{{ equipoActual?.nombre_oficial }}</span>
                    </p>
                  </div>
                  <button @click="openAddPlayerModal"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    + Agregar Jugador
                  </button>
                </div>

                <!-- Stats jugadores -->
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

                <!-- Tabla jugadores -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="px-6 py-4 bg-gray-50 border-b">
                    <h3 class="text-lg font-semibold text-gray-700">Lista de Jugadores</h3>
                  </div>

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
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatura</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capitán</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="player in players" :key="player.id_jugador" class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm font-bold text-indigo-600">#{{ player.numero_camiseta }}</td>
                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ player.nombre }} {{ player.apellido }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ player.posicion }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ player.estatura ? player.estatura + 'm' : '-' }}</td>
                        <td class="px-6 py-4 text-sm">
                          <span v-if="player.es_capitan"
                            class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Capitán
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm font-medium">
                          <button @click="editPlayer(player)" class="text-indigo-600 hover:text-indigo-900 mr-4">
                            Editar
                          </button>
                          <button @click="confirmDisablePlayer(player)" class="text-orange-600 hover:text-orange-900">
                            Deshabilitar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
                <h3 class="text-lg font-medium text-gray-900">Necesitas un equipo primero</h3>
                <button @click="activeTab = 'equipo'" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ir a Equipos
                </button>
              </div>
            </div>

            <!-- ======== TAB: TORNEO ======== -->
            <div v-if="activeTab === 'torneo'" class="space-y-6">
              <h2 class="text-3xl font-bold text-gray-900">Torneo</h2>
              <div class="bg-white rounded-lg shadow-md p-10 text-center">
                <p class="text-gray-500">Próximamente...</p>
              </div>
            </div>

            <!-- ======== TAB: PERFIL ======== -->
            <div v-if="activeTab === 'perfil'" class="space-y-6 max-w-3xl mx-auto">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h2>
                <form @submit.prevent="guardarPerfil" class="space-y-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" v-model="perfilForm.nombre" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <input type="text" v-model="perfilForm.apellido" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" v-model="perfilForm.correo" required
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                  </div>
                  <div class="pt-4 flex justify-end">
                    <button type="submit" :disabled="guardandoPerfil"
                      class="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50">
                      {{ guardandoPerfil ? 'Guardando...' : 'Actualizar Perfil' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>

    <!-- Modales -->
    <ModalEditarEquipo
      :show="showTeamModal"
      :equipo="equipoAEditar"
      @close="closeTeamModal"
      @save="saveTeam"
    />

    <ModalAgregarJugador
      :show="showPlayerModal"
      :jugador="selectedPlayer"
      :nivelEquipo="equipoActual?.id_nivel"
      :numerosEnUso="players.map(p => parseInt(p.numero_camiseta))"
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
  obtenerEquiposPorEntrenadorService,
  crearEquipoService,
  actualizarEquipoService
} from '../services/equiposService'
import {
  obtenerJugadoresPorEquipoService,
  crearJugadorService,
  actualizarJugadorService,
  eliminarJugadorService
} from '../services/jugadoresService'

const router = useRouter()
const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}')

const activeTab = ref('equipo')
const userName = ref(usuarioData.nombre || 'Entrenador')
const equipos = ref([])
const equipoActual = ref(null)
const estadisticas = ref(null)
const players = ref([])
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)
const showTeamModal = ref(false)
const equipoAEditar = ref(null)
const cargandoInicial = ref(true)
const guardandoPerfil = ref(false)

const perfilForm = ref({
  nombre: usuarioData.nombre || '',
  apellido: usuarioData.apellido || '',
  correo: usuarioData.correo || ''
})

// Computeds
const promedioEstatura = computed(() => {
  const con = players.value.filter(p => p.estatura)
  if (!con.length) return 0
  return con.reduce((acc, p) => acc + parseFloat(p.estatura), 0) / con.length
})

const tasaVictorias = computed(() => {
  if (!estadisticas.value || estadisticas.value.partidos_jugados === 0) return 0
  return ((estadisticas.value.victorias / estadisticas.value.partidos_jugados) * 100).toFixed(1)
})

// Equipos
const obtenerTodosLosEquipos = async () => {
  try {
    const idEntrenador = localStorage.getItem('usuario_id')
    const data = await obtenerEquiposPorEntrenadorService(idEntrenador)
    equipos.value = data
    if (equipos.value.length > 0) {
      equipoActual.value = equipos.value.find(e => e.activo) || equipos.value[0]
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
  const sel = equipos.value.find(e => e.id_equipo === idEquipo)
  if (sel) {
    equipoActual.value = sel
    await cargarDatosEquipoActual()
  }
}

const cargarDatosEquipoActual = async () => {
  if (equipoActual.value) {
    await Promise.all([cargarEstadisticas(), cargarJugadores()])
  }
}

const cargarEstadisticas = async () => {
  try {
    const res = await api.get(`/equipos/${equipoActual.value.id_equipo}/estadisticas`)
    estadisticas.value = res.data
  } catch (e) { console.error(e) }
}

const cargarJugadores = async () => {
  if (!equipoActual.value) return
  try {
    players.value = await obtenerJugadoresPorEquipoService(equipoActual.value.id_equipo)
  } catch (e) { console.error(e) }
}

// Modal equipo
const openCreateTeamModal = () => {
  equipoAEditar.value = null
  showTeamModal.value = true
}

const openEditTeamModal = (equipo) => {
  equipoAEditar.value = equipo
  showTeamModal.value = true
}

const closeTeamModal = () => {
  showTeamModal.value = false
  equipoAEditar.value = null
}

const saveTeam = async (teamData) => {
  try {
    const idEntrenador = localStorage.getItem('usuario_id')
    if (equipoAEditar.value) {
      await actualizarEquipoService(equipoAEditar.value.id_equipo, teamData)
    } else {
      await crearEquipoService({ ...teamData, id_entrenador: idEntrenador })
    }
    await obtenerTodosLosEquipos()
    closeTeamModal()
  } catch (error) {
    alert(error.response?.data?.error || 'Error al guardar el equipo')
  }
}

const toggleTeamStatus = async (equipo) => {
  try {
    const endpoint = equipo.activo ? 'deshabilitar' : 'habilitar'
    await api.patch(`/equipos/${equipo.id_equipo}/${endpoint}`)
    equipo.activo = !equipo.activo
    alert(equipo.activo ? 'Equipo habilitado' : 'Equipo deshabilitado')
  } catch (e) {
    alert('Error al cambiar estado del equipo')
  }
}

// Modal jugadores
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
      await actualizarJugadorService(selectedPlayer.value.id_jugador, {
        ...playerData,
        id_equipo: equipoActual.value.id_equipo
      })
    } else {
      await crearJugadorService({ ...playerData, id_equipo: equipoActual.value.id_equipo })
    }
    await cargarJugadores()
    await cargarEstadisticas()
    closePlayerModal()
  } catch (error) {
    alert(error.response?.data?.error || 'Error al guardar el jugador')
  }
}

const confirmDisablePlayer = (player) => {
  if (confirm(`¿Deshabilitar a ${player.nombre} ${player.apellido}?\nSus datos se conservarán.`)) {
    deshabilitarJugador(player)
  }
}

const deshabilitarJugador = async (player) => {
  try {
    await eliminarJugadorService(player.id_jugador, equipoActual.value.id_equipo)
    await cargarJugadores()
    await cargarEstadisticas()
  } catch (e) {
    alert('Error al deshabilitar el jugador')
  }
}

// Perfil
const guardarPerfil = async () => {
  guardandoPerfil.value = true
  try {
    const idUsuario = localStorage.getItem('usuario_id')
    const res = await api.put(`/usuarios/${idUsuario}`, perfilForm.value)
    localStorage.setItem('usuario', JSON.stringify({ ...usuarioData, ...res.data }))
    userName.value = perfilForm.value.nombre
    alert('Perfil actualizado exitosamente')
  } catch (e) {
    alert(e.response?.data?.error || 'Error al actualizar el perfil')
  } finally {
    guardandoPerfil.value = false
  }
}

const navigateTo = (tab) => { activeTab.value = tab }
const logout = () => {
  localStorage.removeItem('usuario')
  localStorage.removeItem('usuario_id')
  router.push('/login')
}

onMounted(async () => {
  try {
    await obtenerTodosLosEquipos()
  } catch (e) {
    console.error('❌ Error en onMounted:', e)
  } finally {
    cargandoInicial.value = false
  }
})

watch(equipoActual, async (nuevo) => {
  if (nuevo && !cargandoInicial.value) {
    await cargarDatosEquipoActual()
  }
})
</script>