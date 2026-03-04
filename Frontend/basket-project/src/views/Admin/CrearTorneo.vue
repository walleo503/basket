<template>
    <div class="space-y-6">
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-900">
                    <button v-if="viewMode === 'gestionar'" @click="volverListado" class="mr-2 text-indigo-600 hover:text-indigo-800 transition-colors">
                        &larr;
                    </button>
                    {{ viewMode === 'crear' ? 'Gestión de Torneos' : 'Administrar Torneo' }}
                </h2>
                <p class="text-gray-600">
                    {{ viewMode === 'crear' ? 'Configura nuevas competiciones para la liga.' : 'Inscribe equipos y gestiona el inicio del torneo.' }}
                </p>
            </div>
            
            <button v-if="viewMode === 'gestionar' && torneoSeleccionado.estado === 'En inscripción'" 
                    @click="handleIniciarTorneo" 
                    class="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                INICIAR COMPETICIÓN
            </button>
        </div>

        <div v-if="viewMode === 'crear'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-5 border-b pb-2">Registrar Torneo</h3>
                <form @submit.prevent="guardarNuevoTorneo" class="space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Oficial del Torneo *</label>
                            <input type="text" v-model="form.nombre_torneo" required placeholder="Ej: Liga Invernal 2026"
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría Basketball *</label>
                            <select v-model="form.categoria" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                <option value="" disabled>Seleccionar nivel...</option>
                                <option value="Sub-12">Sub-12 (Infantil)</option>
                                <option value="Sub-15">Sub-15 (Pasarela)</option>
                                <option value="Sub-18">Sub-18 (Juvenil)</option>
                                <option value="U-23">U-23 (Promesas)</option>
                                <option value="Libre">Libre (Primera División)</option>
                                <option value="Veteranos">Veteranos (+35)</option>
                                <option value="Maxi-Baloncesto">Maxi-Baloncesto (+45)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Género / Clasificación *</label>
                            <select v-model="form.id_clasificacion" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                <option value="" disabled>Seleccionar género...</option>
                                <option value="1">Varonil</option>
                                <option value="2">Femenil</option>
                                <option value="3">Mixto</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                            <input type="date" v-model="form.fecha_inicio" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Tentativa Fin *</label>
                            <input type="date" v-model="form.fecha_fin" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Límite de Equipos (Debe ser PAR, Máx 12) *
                            </label>
                            <input type="number" v-model="form.numero_equipos" required min="2" max="12" step="2"
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700">
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción del Torneo</label>
                            <textarea v-model="form.descripcion" rows="2" placeholder="Información general..."
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Reglamento Oficial del Torneo</label>
                            <textarea v-model="form.reglamento" rows="4" placeholder="Escribe aquí las normas, reglas de desempate, sanciones, etc..."
                                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button type="submit" :disabled="procesando"
                            class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
                            {{ procesando ? 'Procesando...' : 'Crear Torneo' }}
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-gray-100 rounded-lg shadow-inner p-4 h-fit max-h-[850px] overflow-y-auto">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Torneos Activos
                </h3>
                <div v-if="torneos.length === 0" class="text-center py-8 text-gray-500 italic">No hay torneos registrados.</div>
                <div v-else class="space-y-4">
                    <div v-for="t in torneos" :key="t.id_torneo" 
                         @click="seleccionarTorneo(t)"
                         class="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all transform hover:-translate-x-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-gray-900 leading-tight">{{ t.nombre_torneo }}</h4>
                            <span :class="t.estado === 'En inscripción' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                                  class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                                {{ t.estado }}
                            </span>
                        </div>
                        <p class="text-[11px] text-gray-500 mt-1 uppercase font-bold">{{ t.categoria }} | {{ t.clasificacion_genero }}</p>
                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-xs font-bold text-indigo-600">Equipos: {{ t.equipos_inscritos }} / {{ t.numero_equipos }}</span>
                            <div class="flex -space-x-2">
                                <div v-for="i in t.equipos_inscritos" :key="i" class="w-4 h-4 rounded-full bg-indigo-200 border border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex justify-between">
                    Detalles del Torneo
                    <span class="text-sm font-normal text-gray-500">ID: #{{ torneoSeleccionado.id_torneo }}</span>
                </h3>

                <form @submit.prevent="handleActualizarTorneo" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="text-xs font-black text-gray-400 uppercase">Nombre</label>
                            <input type="text" v-model="form.nombre_torneo" :disabled="torneoSeleccionado.estado !== 'En inscripción'"
                                class="w-full px-3 py-2 border rounded bg-gray-50 font-medium">
                        </div>
                        <div>
                            <label class="text-xs font-black text-gray-400 uppercase">Categoría</label>
                            <select v-model="form.categoria" :disabled="torneoSeleccionado.estado !== 'En inscripción'" class="w-full px-3 py-2 border rounded bg-gray-50">
                                <option value="Sub-12">Sub-12</option>
                                <option value="Sub-15">Sub-15</option>
                                <option value="Sub-18">Sub-18</option>
                                <option value="U-23">U-23</option>
                                <option value="Libre">Libre</option>
                                <option value="Veteranos">Veteranos</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-black text-gray-400 uppercase">Cupos (Pares)</label>
                            <input type="number" v-model="form.numero_equipos" step="2" min="2" max="12" :disabled="torneoSeleccionado.estado !== 'En inscripción'"
                                class="w-full px-3 py-2 border rounded bg-gray-50 font-bold text-indigo-600">
                        </div>
                        <div>
                            <label class="text-xs font-black text-gray-400 uppercase">Fecha Inicio</label>
                            <input type="date" v-model="form.fecha_inicio" :disabled="torneoSeleccionado.estado !== 'En inscripción'" class="w-full px-3 py-2 border rounded bg-gray-50">
                        </div>
                        <div>
                            <label class="text-xs font-black text-gray-400 uppercase">Fecha Fin</label>
                            <input type="date" v-model="form.fecha_fin" :disabled="torneoSeleccionado.estado !== 'En inscripción'" class="w-full px-3 py-2 border rounded bg-gray-50">
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-black text-gray-400 uppercase">Reglamento</label>
                        <textarea v-model="form.reglamento" rows="6" :disabled="torneoSeleccionado.estado !== 'En inscripción'"
                            class="w-full px-3 py-2 border rounded bg-gray-50 text-sm italic"></textarea>
                    </div>

                    <div v-if="torneoSeleccionado.estado === 'En inscripción'" class="flex justify-between pt-4 border-t mt-4">
                        <button type="button" @click="handleEliminarTorneo" 
                                :disabled="torneoSeleccionado.equipos_inscritos > 0 || procesando"
                                :class="torneoSeleccionado.equipos_inscritos > 0 ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600 hover:bg-red-200'"
                                class="px-4 py-2 rounded font-bold transition flex items-center text-sm"
                                :title="torneoSeleccionado.equipos_inscritos > 0 ? 'Debes quitar todos los equipos para poder eliminarlo' : ''">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Cancelar Torneo
                        </button>
                        
                        <button type="submit" class="px-5 py-2 bg-gray-800 text-white rounded text-sm font-bold hover:bg-black transition">
                            Actualizar Bases
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-indigo-900">Equipos Participantes</h3>
                        <p class="text-sm text-indigo-700">Estado: {{ torneoSeleccionado.estado }}</p>
                    </div>
                    <div class="bg-white px-4 py-2 rounded-lg border border-indigo-200 text-center">
                        <p class="text-[10px] font-black text-indigo-400 uppercase">Inscritos</p>
                        <p class="text-2xl font-black text-indigo-700">{{ torneoSeleccionado.equipos_inscritos }} / {{ form.numero_equipos }}</p>
                    </div>
                </div>

                <div v-if="torneoSeleccionado.estado === 'En curso'" class="bg-white p-8 rounded-xl border border-gray-200 text-center">
                    <svg class="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p class="text-gray-600 font-bold">El torneo ya está en marcha.</p>
                    <p class="text-sm text-gray-400">No se pueden añadir más equipos.</p>
                </div>

                <div v-else>
                    <div class="mb-4">
                        <h4 class="text-xs font-black text-indigo-400 uppercase mb-3">Reclutar Equipos Disponibles</h4>
                        <div v-if="equiposElegibles.length === 0" class="bg-white/50 p-4 rounded text-center text-sm text-indigo-400 italic">
                            No hay más equipos activos con entrenador en esta categoría.
                        </div>
                        <ul class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            <li v-for="eq in equiposElegibles" :key="eq.id_equipo" 
                                class="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm border border-indigo-100">
                                <div>
                                    <p class="font-bold text-gray-800 text-sm">{{ eq.nombre_oficial }}</p>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase">{{ eq.nombre_cancha || 'Sin Sede' }}</p>
                                </div>
                                <button @click="handleInscribirEquipo(eq)" :disabled="torneoSeleccionado.equipos_inscritos >= form.numero_equipos"
                                    class="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded hover:bg-indigo-700 disabled:bg-gray-300 transition-colors uppercase">
                                    Inscribir
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
    crearTorneoService, 
    obtenerTorneosActivosService, 
    editarTorneoService, 
    iniciarTorneoService, 
    obtenerEquiposElegiblesService, 
    inscribirEquipoService,
    eliminarTorneoService
} from '../../services/torneosService'

const viewMode = ref('crear')
const procesando = ref(false)
const torneos = ref([])
const torneoSeleccionado = ref(null)
const equiposElegibles = ref([])

const form = ref({
    nombre_torneo: '', 
    descripcion: '', 
    categoria: '',
    fecha_inicio: '', 
    fecha_fin: '', 
    numero_equipos: 8,
    id_clasificacion: '', 
    reglamento: ''
})

const cargarTorneos = async () => {
    try {
        torneos.value = await obtenerTorneosActivosService()
    } catch (error) {
        console.error("Error cargando torneos", error)
    }
}

const guardarNuevoTorneo = async () => {
    if (new Date(form.value.fecha_inicio) > new Date(form.value.fecha_fin)) {
        return alert('Error: La fecha de inicio es mayor a la de fin.')
    }
    procesando.value = true
    try {
        await crearTorneoService(form.value)
        alert('Torneo creado exitosamente. Ahora puedes añadir equipos.')
        limpiarForm()
        await cargarTorneos()
    } catch (error) {
        alert(error.response?.data?.error || 'Error al guardar')
    } finally {
        procesando.value = false
    }
}

const seleccionarTorneo = async (torneo) => {
    torneoSeleccionado.value = torneo
    form.value = {
        ...torneo,
        fecha_inicio: torneo.fecha_inicio ? torneo.fecha_inicio.split('T')[0] : '',
        fecha_fin: torneo.fecha_fin ? torneo.fecha_fin.split('T')[0] : ''
    }
    viewMode.value = 'gestionar'
    if (torneo.estado === 'En inscripción') {
        await cargarEquiposElegibles(torneo.id_torneo)
    }
}

const cargarEquiposElegibles = async (id) => {
    try {
        equiposElegibles.value = await obtenerEquiposElegiblesService(id)
    } catch (error) {
        console.error("Error elegibles")
    }
}

const handleInscribirEquipo = async (equipo) => {
    try {
        await inscribirEquipoService(torneoSeleccionado.value.id_torneo, equipo.id_equipo)
        torneoSeleccionado.value.equipos_inscritos++
        equiposElegibles.value = equiposElegibles.value.filter(e => e.id_equipo !== equipo.id_equipo)
    } catch (error) {
        alert(error.response?.data?.error || 'Error al inscribir')
    }
}

const handleActualizarTorneo = async () => {
    try {
        await editarTorneoService(torneoSeleccionado.value.id_torneo, form.value)
        alert('Bases del torneo actualizadas.')
        await cargarTorneos()
    } catch (error) {
        alert(error.response?.data?.error || 'Error al actualizar')
    }
}

const handleIniciarTorneo = async () => {
    const total = torneoSeleccionado.value.equipos_inscritos
    if (total % 2 !== 0) {
        return alert('REGLA DE COMPETICIÓN: No se puede iniciar con equipos impares. Debes añadir o quitar un equipo.')
    }
    
    if (!confirm('¿Confirmas el inicio del torneo? Se cerrarán las inscripciones permanentemente.')) return

    try {
        await iniciarTorneoService(torneoSeleccionado.value.id_torneo)
        alert('¡TORNEO INICIADO! Se ha generado el calendario base.')
        torneoSeleccionado.value.estado = 'En curso'
        await cargarTorneos()
    } catch (error) {
        alert(error.response?.data?.error || 'Error al iniciar')
    }
}
const handleEliminarTorneo = async () => {
    if (!confirm(`¿Estás 100% seguro de cancelar y eliminar el torneo "${torneoSeleccionado.value.nombre_torneo}"? Esta acción no se puede deshacer.`)) return;

    procesando.value = true;
    try {
        await eliminarTorneoService(torneoSeleccionado.value.id_torneo);
        alert('Torneo eliminado del sistema.');
        volverListado(); 
    } catch (error) {
        alert(error.response?.data?.error || 'No se pudo eliminar el torneo.');
    } finally {
        procesando.value = false;
    }
}
const volverListado = () => {
    viewMode.value = 'crear'
    torneoSeleccionado.value = null
    limpiarForm()
    cargarTorneos()
}

const limpiarForm = () => {
    form.value = {
        nombre_torneo: '', descripcion: '', categoria: '',
        fecha_inicio: '', fecha_fin: '', numero_equipos: 8,
        id_clasificacion: '', reglamento: ''
    }
}

onMounted(cargarTorneos)
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>