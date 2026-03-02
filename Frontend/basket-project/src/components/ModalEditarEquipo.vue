<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Fondo oscuro (overlay) -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close" aria-hidden="true"></div>

      <!-- Truco para centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal flotante -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        
        <!-- Cabecera del modal -->
        <div class="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900" id="modal-title">
              {{ equipo ? '✏️ Editar Equipo' : '✨ Crear Nuevo Equipo' }}
            </h3>
            <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            Completa los datos de tu equipo
          </p>
        </div>

        <!-- Cuerpo del formulario -->
        <form @submit.prevent="handleSubmit">
          <div class="bg-gray-50 px-6 py-5 space-y-5">
            <!-- Nombre del Equipo -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Nombre del Equipo <span class="text-red-500">*</span>
              </label>
              <input type="text" v-model="form.nombre_oficial" required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ej: Águilas Basketball">
            </div>

            <!-- Grid de 2 columnas para Siglas y Categoría -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Siglas <span class="text-red-500">*</span>
                </label>
                <input type="text" v-model="form.siglas" required maxlength="10"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ej: AGU">
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Categoría <span class="text-red-500">*</span>
                </label>
                <select v-model="form.id_clasificacion" required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors">
                  <option value="" disabled>Seleccionar categoría</option>
                  <option value="1">🏀 Varonil</option>
                  <option value="2">🏀 Femenil</option>
                  <option value="3">🏀 Mixto</option>
                </select>
              </div>
            </div>

            <!-- Dirección / Sede -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Sede / Dirección
              </label>
              <input type="text" v-model="form.direccion_cancha"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ej: Calle Principal #123, San Salvador">
            </div>

            <!-- Cancha (selector desplegable con opción de nueva) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Cancha / Estadio
              </label>
              
              <div class="flex items-center space-x-2 mb-2">
                <button type="button" @click="mostrarNuevaCancha = !mostrarNuevaCancha"
                  class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ mostrarNuevaCancha ? 'Usar cancha existente' : 'Registrar nueva cancha' }}
                </button>
              </div>

              <!-- Selector de cancha existente -->
              <div v-if="!mostrarNuevaCancha">
                <select v-model="form.id_cancha"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">Sin cancha asignada</option>
                  <option v-for="cancha in canchas" :key="cancha.id_cancha" :value="cancha.id_cancha">
                    {{ cancha.nombre_cancha }} - {{ cancha.direccion }}
                  </option>
                </select>
              </div>

              <!-- Formulario para nueva cancha -->
              <div v-else class="space-y-3 border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <h4 class="text-sm font-semibold text-indigo-800">Registrar nueva cancha</h4>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de la cancha</label>
                  <input type="text" v-model="nuevaCancha.nombre_cancha"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
                  <input type="text" v-model="nuevaCancha.direccion"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Capacidad</label>
                  <input type="number" v-model="nuevaCancha.capacidad" min="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>

            <!-- Mensajes de error/éxito -->
            <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {{ errorMessage }}
            </div>
          </div>

          <!-- Footer con botones -->
          <div class="bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" @click="close"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" 
              :disabled="loading"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Guardando...' : (equipo ? 'Actualizar Equipo' : 'Crear Equipo') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '../Enviroments/enviroment'

const props = defineProps({
  show: Boolean,
  equipo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

// Estado del formulario
const form = ref({
  nombre_oficial: '',
  siglas: '',
  id_clasificacion: '',
  direccion_cancha: '',
  id_cancha: ''
})

// Estado para nueva cancha
const mostrarNuevaCancha = ref(false)
const canchas = ref([])
const nuevaCancha = ref({
  nombre_cancha: '',
  direccion: '',
  capacidad: ''
})

const loading = ref(false)
const errorMessage = ref('')

// Cargar canchas existentes
const cargarCanchas = async () => {
  try {
    const response = await api.get('/canchas')
    canchas.value = response.data
  } catch (error) {
    console.error('Error al cargar canchas:', error)
  }
}

// Resetear formulario
const resetForm = () => {
  form.value = {
    nombre_oficial: '',
    siglas: '',
    id_clasificacion: '',
    direccion_cancha: '',
    id_cancha: ''
  }
  nuevaCancha.value = {
    nombre_cancha: '',
    direccion: '',
    capacidad: ''
  }
  mostrarNuevaCancha.value = false
  errorMessage.value = ''
}

// Cargar datos cuando se abre el modal
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await cargarCanchas()
    
    if (props.equipo) {
      // Modo edición
      form.value = {
        nombre_oficial: props.equipo.nombre_oficial || '',
        siglas: props.equipo.siglas || '',
        id_clasificacion: props.equipo.id_clasificacion ? String(props.equipo.id_clasificacion) : '',
        direccion_cancha: props.equipo.direccion_cancha || '',
        id_cancha: props.equipo.id_cancha || ''
      }
    } else {
      // Modo creación
      resetForm()
    }
  }
})

// Guardar equipo
const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const dataToSend = {
      nombre_oficial: form.value.nombre_oficial,
      siglas: form.value.siglas,
      id_clasificacion: parseInt(form.value.id_clasificacion),
      direccion_cancha: form.value.direccion_cancha || null,
      id_entrenador: localStorage.getItem('usuario_id')
    }

    // Si se está creando una nueva cancha
    if (mostrarNuevaCancha.value && nuevaCancha.value.nombre_cancha) {
      // Primero crear la cancha
      const canchaResponse = await api.post('/canchas', {
        nombre_cancha: nuevaCancha.value.nombre_cancha,
        direccion: nuevaCancha.value.direccion,
        capacidad: nuevaCancha.value.capacidad ? parseInt(nuevaCancha.value.capacidad) : null
      })
      dataToSend.id_cancha = canchaResponse.data.id_cancha
    } else if (form.value.id_cancha) {
      // Usar cancha existente
      dataToSend.id_cancha = parseInt(form.value.id_cancha)
    }

    if (props.equipo) {
      // Actualizar equipo existente
      await api.put(`/equipos/${props.equipo.id_equipo}`, dataToSend)
    } else {
      // Crear nuevo equipo
      await api.post('/equipos', dataToSend)
    }
    
    emit('save')
    close()
    
  } catch (error) {
    console.error('Error al guardar equipo:', error)
    errorMessage.value = error.response?.data?.error || 'Error al guardar el equipo'
  } finally {
    loading.value = false
  }
}

const close = () => {
  resetForm()
  emit('close')
}
</script>