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
                        <!-- Sección Equipo -->
                        <div v-if="activeTab === 'equipo'" class="space-y-6">
                            
                            <div v-if="hasTeam" class="space-y-6">
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
                                        <button @click="openEditTeamModal" 
                                            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                            Editar Equipo
                                        </button>
                                        <button @click="toggleTeamStatus" 
                                            :class="[
                                                'px-4 py-2 rounded-md transition-colors shadow-sm',
                                                equipoActual?.activo 
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            ]">
                                            {{ equipoActual?.activo ? 'Deshabilitar Equipo' : 'Habilitar Equipo' }}
                                        </button>
                                    </div>
                                </div>

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

                                <div class="bg-white rounded-lg shadow-md p-6">
                                    <h3 class="text-lg font-bold text-gray-900 mb-4">Próximos Partidos</h3>
                                    <!-- Aquí iría la lista de próximos partidos -->
                                    <p class="text-gray-500 text-center py-8">No hay partidos programados</p>
                                </div>
                            </div>

                            <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-md">
                                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-2">Aún no tienes un equipo</h2>
                                <p class="text-gray-600 mb-6 text-center max-w-md">Para empezar a gestionar jugadores, partidos y estadísticas, primero necesitas registrar tu equipo oficial.</p>
                                <button @click="$router.push('/crear-equipo')" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                    Registrar Mi Equipo
                                </button>
                            </div>

                        </div>

                        <!-- Sección Jugadores -->
                        <div v-if="activeTab === 'jugadores'" class="space-y-6">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h2 class="text-3xl font-bold text-gray-900">Jugadores</h2>
                                    <p class="mt-2 text-gray-600">Gestiona los jugadores de tu equipo</p>
                                </div>
                                <button @click="openAddPlayerModal"
                                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                    + Agregar Jugador
                                </button>
                            </div>

                            <!-- Tarjetas de estadísticas -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <!-- Tabla de jugadores -->
                            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                                <div v-if="players.length === 0" class="text-center py-12">
                                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 class="mt-2 text-sm font-medium text-gray-900">No hay jugadores</h3>
                                    <p class="mt-1 text-sm text-gray-500">Comienza agregando jugadores a tu equipo.</p>
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

                        <!-- Sección Torneo -->
                        <div v-if="activeTab === 'torneo'" class="space-y-6">
                            <div>
                                <h2 class="text-3xl font-bold text-gray-900">Torneo</h2>
                                <p class="mt-2 text-gray-600">Información del torneo y clasificaciones</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="bg-white rounded-lg shadow-md p-6">
                                    <h3 class="text-lg font-bold text-gray-900 mb-4">Torneo Actual</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="text-gray-600 text-sm">Nombre</p>
                                            <p class="font-medium text-gray-900">Campeonato Nacional 2026</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-600 text-sm">Fase</p>
                                            <p class="font-medium text-gray-900">Grupo A</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-600 text-sm">Posición</p>
                                            <p class="font-medium text-2xl text-indigo-600">#1</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-white rounded-lg shadow-md p-6">
                                    <h3 class="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>
                                    <div class="space-y-3">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Puntos</span>
                                            <span class="font-bold text-gray-900">24</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Partidos</span>
                                            <span class="font-bold text-gray-900">8</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Victorias</span>
                                            <span class="font-bold text-green-600">6</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Derrotas</span>
                                            <span class="font-bold text-red-600">2</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-white rounded-lg shadow-md p-6">
                                    <h3 class="text-lg font-bold text-gray-900 mb-4">Próxima Jornada</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="text-gray-600 text-sm">Rival</p>
                                            <p class="font-medium text-gray-900">Equipo C</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-600 text-sm">Fecha</p>
                                            <p class="font-medium text-gray-900">22 de Febrero</p>
                                        </div>
                                        <div>
                                            <p class="text-gray-600 text-sm">Lugar</p>
                                            <p class="font-medium text-gray-900">Cancha Local</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-lg shadow-md p-6">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">Tabla de Posiciones</h3>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Posición
                                                </th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Equipo
                                                </th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    PJ
                                                </th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    V
                                                </th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    D
                                                </th>
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Pts
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-200">
                                            <tr v-for="team in standings" :key="team.id"
                                                :class="team.name === 'Mi Equipo' ? 'bg-indigo-50' : ''">
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {{ team.position }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {{ team.name }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {{ team.played }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                    {{ team.wins }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                    {{ team.losses }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {{ team.points }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Sección Perfil -->
                        <div v-if="activeTab === 'perfil'" class="space-y-6">
                            <div>
                                <h2 class="text-3xl font-bold text-gray-900">Mi Perfil</h2>
                                <p class="mt-2 text-gray-600">Información personal y detalles de tu cuenta</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="md:col-span-1">
                                    <div class="bg-white rounded-lg shadow-md p-6">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                                                <svg class="h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 class="text-lg font-bold text-gray-900 text-center">{{ userName }}</h3>
                                            <p class="text-gray-600 text-sm">Entrenador Principal</p>
                                            <button
                                                class="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                Cambiar Foto
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="md:col-span-2">
                                    <div class="bg-white rounded-lg shadow-md p-6">
                                        <h3 class="text-lg font-bold text-gray-900 mb-6">Información Personal</h3>
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre
                                                    Completo</label>
                                                <input type="text" v-model="profile.fullName"
                                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Nombre Completo" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Correo
                                                    Electrónico</label>
                                                <input type="email" v-model="profile.email"
                                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="correo@ejemplo.com" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                                <input type="tel" v-model="profile.phone"
                                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Teléfono" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Experiencia</label>
                                                <select v-model="profile.experience"
                                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option>0-5 años</option>
                                                    <option>5-10 años</option>
                                                    <option>10-15 años</option>
                                                    <option>15+ años</option>
                                                </select>
                                            </div>
                                            <button
                                                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Modal Agregar/Editar Jugador (AHORA DENTRO DEL DIV PRINCIPAL) -->
        <ModalAgregarJugador 
            :show="showPlayerModal"
            :jugador="selectedPlayer"
            @close="closePlayerModal"
            @save="savePlayer"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import ModalAgregarJugador from '../components/ModalAgregarJugador.vue'
import { api } from '../Enviroments/enviroment'
import { obtenerEquipoDeEntrenadorService } from '../services/equipossService'
import { 
    obtenerJugadoresPorEquipoService, 
    crearJugadorService, 
    actualizarJugadorService, 
    eliminarJugadorService 
} from '../services/jugadoresService'

const router = useRouter()
const activeTab = ref('equipo')
const userName = ref('Entrenador')
const hasTeam = ref(false)
const equipoActual = ref(null)
const estadisticas = ref(null)

// Variables para jugadores
const players = ref([])
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)

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

// Métodos para obtener datos
const obtenerMiEquipo = async () => {
    try {
        const idEntrenador = localStorage.getItem('usuario_id')
        const data = await obtenerEquipoDeEntrenadorService(idEntrenador)
        
        if (data) {
            hasTeam.value = true
            equipoActual.value = data
            await cargarEstadisticas()
        }
    } catch (error) {
        if (error.response?.status === 404) {
            hasTeam.value = false
        } else {
            console.error("Error al obtener el equipo:", error)
        }
    }
}

const cargarEstadisticas = async () => {
    if (equipoActual.value) {
        try {
            const response = await api.get(`/equipos/${equipoActual.value.id_equipo}/estadisticas`)
            estadisticas.value = response.data
        } catch (error) {
            console.error('Error al cargar estadísticas:', error)
        }
    }
}

// Métodos para jugadores
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

// Métodos para equipo
const openEditTeamModal = () => {
    // Aquí puedes abrir un modal para editar equipo
    alert('Funcionalidad de editar equipo - Próximamente')
}

const toggleTeamStatus = async () => {
    try {
        const endpoint = equipoActual.value.activo ? 'deshabilitar' : 'habilitar'
        await api.patch(`/equipos/${equipoActual.value.id_equipo}/${endpoint}`)
        
        // Actualizar estado local
        equipoActual.value.activo = !equipoActual.value.activo
        
        const mensaje = equipoActual.value.activo 
            ? 'Equipo habilitado correctamente' 
            : 'Equipo deshabilitado correctamente'
        
        alert(mensaje)
    } catch (error) {
        console.error('Error al cambiar estado del equipo:', error)
        alert('Error al cambiar el estado del equipo')
    }
}

// Métodos de navegación
const navigateTo = (tab) => {
    activeTab.value = tab
}

const logout = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('usuario_id')
    router.push('/login')
}

// Datos de ejemplo para standings
standings.value = [
    { id: 1, name: 'Equipo A', position: 1, played: 10, wins: 8, losses: 2, points: 16 },
    { id: 2, name: 'Equipo B', position: 2, played: 10, wins: 7, losses: 3, points: 14 },
    { id: 3, name: 'Mi Equipo', position: 3, played: 10, wins: 6, losses: 4, points: 12 },
    { id: 4, name: 'Equipo C', position: 4, played: 10, wins: 5, losses: 5, points: 10 },
]

// Lifecycle
onMounted(async () => {
    await obtenerMiEquipo()
    if (equipoActual.value) {
        await cargarJugadores()
    }
})
</script>