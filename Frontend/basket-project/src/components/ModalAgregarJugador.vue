<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="close"></div>

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          <!-- Cabecera -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                {{ isEditing ? '✏️ Editar Jugador' : '➕ Agregar Nuevo Jugador' }}
              </h3>
              <button type="button" @click="close" class="text-gray-400 hover:text-gray-600">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Nivel del equipo: 
              <span class="font-semibold" :class="nivelEquipo == 1 ? 'text-blue-600' : 'text-purple-600'">
                {{ nivelEquipo == 1 ? '🎯 Amateur (edad: 5-16)' : nivelEquipo == 2 ? '⭐ Profesional (edad: 19+)' : 'No definido' }}
              </span>
            </p>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

              <!-- Nombre y Apellido -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre <span class="text-red-500">*</span>
                  </label>
                  <input type="text" v-model="form.nombre" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Juan">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Apellido <span class="text-red-500">*</span>
                  </label>
                  <input type="text" v-model="form.apellido" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Pérez">
                </div>
              </div>

              <!-- Número y Estatura -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Número de Camiseta <span class="text-red-500">*</span>
                  </label>
                  <input type="number" v-model="form.numero_camiseta" required min="0" max="99"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    :class="errores.numero ? 'border-red-400' : 'border-gray-300'"
                    @blur="validarNumero"
                    placeholder="Ej: 23">
                  <p v-if="errores.numero" class="text-red-500 text-xs mt-1">{{ errores.numero }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Estatura (m)</label>
                  <input type="number" step="0.01" v-model="form.estatura" min="1.00" max="2.50"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: 1.85">
                </div>
              </div>

              <!-- Posición oficial -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Posición <span class="text-red-500">*</span>
                </label>
                <select v-model="form.posicion" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="" disabled>Seleccionar posición</option>
                  <option value="Base">🏀 Base (Point Guard - PG)</option>
                  <option value="Escolta">🏀 Escolta (Shooting Guard - SG)</option>
                  <option value="Alero">🏀 Alero (Small Forward - SF)</option>
                  <option value="Ala-Pívot">🏀 Ala-Pívot (Power Forward - PF)</option>
                  <option value="Pívot">🏀 Pívot (Center - C)</option>
                </select>
              </div>

              <!-- Fecha de Nacimiento -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  Fecha de Nacimiento <span class="text-red-500">*</span>
                </label>
                <input type="date" v-model="form.fecha_nacimiento" required
                  :min="fechaMinima" :max="fechaMaxima"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  :class="errores.fecha ? 'border-red-400' : 'border-gray-300'"
                  @change="validarFecha">
                <p class="text-xs text-gray-400 mt-1">
                  <span v-if="nivelEquipo == 1">Amateur: jugador debe tener entre 5 y 16 años</span>
                  <span v-else-if="nivelEquipo == 2">Profesional: jugador debe tener 19 años o más</span>
                </p>
                <p v-if="errores.fecha" class="text-red-500 text-xs mt-1">{{ errores.fecha }}</p>
              </div>

              <!-- Capitán -->
              <div class="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <input type="checkbox" v-model="form.es_capitan" id="capitan"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                <label for="capitan" class="ml-2 text-sm text-gray-700 font-medium">
                  ⭐ Es capitán del equipo
                </label>
              </div>

              <!-- Error general -->
              <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                ⚠️ {{ errorMessage }}
              </div>
            </div>

            <!-- Botones -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-xl">
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
                {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar Jugador') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  jugador: { type: Object, default: null },
  nivelEquipo: { type: [Number, String], default: null },
  // Números ya usados en el equipo para validar duplicados en frontend
  numerosEnUso: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nombre: '', apellido: '', numero_camiseta: '', posicion: '',
  estatura: '', fecha_nacimiento: '', es_capitan: false
})
const isEditing = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errores = ref({})

// Calcular fechas límite según nivel
const fechaMinima = computed(() => {
  const hoy = new Date()
  if (props.nivelEquipo == 1) {
    // Amateur: máximo 16 años → fecha mínima = hoy - 16 años
    const min = new Date(hoy.getFullYear() - 16, hoy.getMonth(), hoy.getDate())
    return min.toISOString().split('T')[0]
  } else if (props.nivelEquipo == 2) {
    // Profesional: mínimo 19 años → fecha máxima = hoy - 19 años
    return '1900-01-01'
  }
  return '1900-01-01'
})

const fechaMaxima = computed(() => {
  const hoy = new Date()
  if (props.nivelEquipo == 1) {
    // Amateur: mínimo 5 años → fecha máxima = hoy - 5 años
    const max = new Date(hoy.getFullYear() - 5, hoy.getMonth(), hoy.getDate())
    return max.toISOString().split('T')[0]
  } else if (props.nivelEquipo == 2) {
    // Profesional: mínimo 19 años → fecha máxima = hoy - 19 años
    const max = new Date(hoy.getFullYear() - 19, hoy.getMonth(), hoy.getDate())
    return max.toISOString().split('T')[0]
  }
  return new Date().toISOString().split('T')[0]
})

const validarNumero = () => {
  const num = parseInt(form.value.numero_camiseta)
  if (isNaN(num) || num < 0 || num > 99) {
    errores.value.numero = 'El número debe ser entre 0 y 99'
    return
  }
  // Validar duplicado en frontend (el backend también valida)
  const yaUsado = props.numerosEnUso.filter(n => n !== props.jugador?.numero_camiseta).includes(num)
  if (yaUsado) {
    errores.value.numero = `El número ${num} ya está en uso en este equipo`
    return
  }
  delete errores.value.numero
}

const validarFecha = () => {
  if (!form.value.fecha_nacimiento) return
  const hoy = new Date()
  const nacimiento = new Date(form.value.fecha_nacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--

  if (props.nivelEquipo == 1 && (edad < 5 || edad > 16)) {
    errores.value.fecha = `Para Amateur el jugador debe tener entre 5 y 16 años (edad: ${edad})`
  } else if (props.nivelEquipo == 2 && edad < 19) {
    errores.value.fecha = `Para Profesional el jugador debe tener al menos 19 años (edad: ${edad})`
  } else {
    delete errores.value.fecha
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    errores.value = {}
    errorMessage.value = ''
    loading.value = false
    if (props.jugador) {
      form.value = {
        nombre: props.jugador.nombre || '',
        apellido: props.jugador.apellido || '',
        numero_camiseta: props.jugador.numero_camiseta || '',
        posicion: props.jugador.posicion || '',
        estatura: props.jugador.estatura || '',
        fecha_nacimiento: props.jugador.fecha_nacimiento
          ? props.jugador.fecha_nacimiento.split('T')[0]
          : '',
        es_capitan: props.jugador.es_capitan || false
      }
      isEditing.value = true
    } else {
      resetForm()
      isEditing.value = false
    }
  }
})

const resetForm = () => {
  form.value = { nombre: '', apellido: '', numero_camiseta: '', posicion: '', estatura: '', fecha_nacimiento: '', es_capitan: false }
  errores.value = {}
  errorMessage.value = ''
}

const handleSubmit = () => {
  // Validar campos requeridos
  if (!form.value.nombre || !form.value.apellido || !form.value.numero_camiseta || 
      !form.value.posicion || !form.value.fecha_nacimiento) {
    errorMessage.value = 'Por favor completa todos los campos requeridos (*)'
    return
  }
  validarNumero()
  validarFecha()
  if (errores.value.numero || errores.value.fecha) return

  loading.value = true
  emit('save', { ...form.value })
}

const close = () => {
  resetForm()
  loading.value = false
  emit('close')
}
</script>