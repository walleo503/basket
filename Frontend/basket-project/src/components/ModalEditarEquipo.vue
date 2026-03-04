<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="close"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
          
          <!-- Cabecera -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                {{ equipo ? '✏️ Editar Equipo' : '✨ Crear Nuevo Equipo' }}
              </h3>
              <button type="button" @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">Completa los datos de tu equipo</p>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="handleSubmit">
            <div class="bg-gray-50 px-6 py-5 space-y-5">

              <!-- Nombre del Equipo -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre del Equipo <span class="text-red-500">*</span>
                </label>
                <input type="text" v-model="form.nombre_oficial" required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Águilas Basketball">
              </div>

              <!-- Siglas y Categoría -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Siglas <span class="text-red-500">*</span>
                  </label>
                  <input type="text" v-model="form.siglas" required maxlength="10"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: AGU">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Categoría <span class="text-red-500">*</span>
                  </label>
                  <select v-model="form.id_clasificacion" required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option value="" disabled>Seleccionar categoría</option>
                    <option value="1">🏀 Varonil</option>
                    <option value="2">🏀 Femenil</option>
                    <option value="3">🏀 Mixto</option>
                  </select>
                </div>
              </div>

              <!-- Sede / Dirección -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Sede / Dirección</label>
                <input type="text" v-model="form.direccion_cancha"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Calle Principal #123, San Salvador">
              </div>

              <!-- Cancha -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Cancha / Estadio</label>
                <button type="button" @click="mostrarNuevaCancha = !mostrarNuevaCancha"
                  class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mb-2">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ mostrarNuevaCancha ? 'Usar cancha existente' : 'Registrar nueva cancha' }}
                </button>

                <div v-if="!mostrarNuevaCancha">
                  <select v-model="form.id_cancha"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">Sin cancha asignada</option>
                    <option v-for="cancha in canchas" :key="cancha.id_cancha" :value="cancha.id_cancha">
                      {{ cancha.nombre_cancha }} - {{ cancha.direccion }}
                    </option>
                  </select>
                </div>

                <div v-else class="space-y-3 border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                  <h4 class="text-sm font-semibold text-indigo-800">Registrar nueva cancha</h4>
                  <input type="text" v-model="nuevaCancha.nombre_cancha" placeholder="Nombre de la cancha"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                  <input type="text" v-model="nuevaCancha.direccion" placeholder="Dirección"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                  <input type="number" v-model="nuevaCancha.capacidad" placeholder="Capacidad" min="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                </div>
              </div>

              <!-- Error -->
              <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {{ errorMessage }}
              </div>
            </div>

            <!-- Botones footer -->
            <div class="bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-xl">
              <button type="button" @click="close"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" :disabled="loading"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center">
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
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '../Enviroments/enviroment'

const props = defineProps({
  show: Boolean,
  equipo: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nombre_oficial: '',
  siglas: '',
  id_clasificacion: '',
  direccion_cancha: '',
  id_cancha: ''
})

const mostrarNuevaCancha = ref(false)
const canchas = ref([])
const nuevaCancha = ref({ nombre_cancha: '', direccion: '', capacidad: '' })
const loading = ref(false)
const errorMessage = ref('')

const cargarCanchas = async () => {
  try {
    const response = await api.get('/canchas')
    canchas.value = response.data
  } catch (error) {
    console.error('Error al cargar canchas:', error)
  }
}

const resetForm = () => {
  form.value = { nombre_oficial: '', siglas: '', id_clasificacion: '', direccion_cancha: '', id_cancha: '' }
  nuevaCancha.value = { nombre_cancha: '', direccion: '', capacidad: '' }
  mostrarNuevaCancha.value = false
  errorMessage.value = ''
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await cargarCanchas()
    if (props.equipo) {
      form.value = {
        nombre_oficial: props.equipo.nombre_oficial || '',
        siglas: props.equipo.siglas || '',
        id_clasificacion: props.equipo.id_clasificacion ? String(props.equipo.id_clasificacion) : '',
        direccion_cancha: props.equipo.direccion_cancha || '',
        id_cancha: props.equipo.id_cancha || ''
      }
    } else {
      resetForm()
    }
  }
})

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const dataToSend = {
      nombre_oficial: form.value.nombre_oficial,
      siglas: form.value.siglas,
      id_clasificacion: parseInt(form.value.id_clasificacion),
      direccion_cancha: form.value.direccion_cancha || null,
    }

    if (mostrarNuevaCancha.value && nuevaCancha.value.nombre_cancha) {
      const canchaResponse = await api.post('/canchas', {
        nombre_cancha: nuevaCancha.value.nombre_cancha,
        direccion: nuevaCancha.value.direccion,
        capacidad: nuevaCancha.value.capacidad ? parseInt(nuevaCancha.value.capacidad) : null
      })
      dataToSend.id_cancha = canchaResponse.data.id_cancha
    } else if (form.value.id_cancha) {
      dataToSend.id_cancha = parseInt(form.value.id_cancha)
    }

    emit('save', dataToSend)
    close()
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al guardar el equipo'
    loading.value = false
  }
}

const close = () => {
  resetForm()
  emit('close')
}
</script>