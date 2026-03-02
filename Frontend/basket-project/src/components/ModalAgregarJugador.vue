<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
      
      <div class="relative bg-white rounded-lg max-w-md w-full p-6">
        <div class="absolute top-4 right-4">
          <button @click="close" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-6">
          {{ isEditing ? 'Editar Jugador' : 'Agregar Nuevo Jugador' }}
        </h3>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" v-model="form.nombre" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" v-model="form.apellido" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input type="number" v-model="form.numero_camiseta" required min="0" max="99"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estatura (m)</label>
                <input type="number" step="0.01" v-model="form.estatura" min="1.40" max="2.30"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Posición</label>
              <select v-model="form.posicion" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar posición</option>
                <option value="Base">Base</option>
                <option value="Escolta">Escolta</option>
                <option value="Alero">Alero</option>
                <option value="Ala-pívot">Ala-pívot</option>
                <option value="Pívot">Pívot</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" v-model="form.fecha_nacimiento"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div class="flex items-center">
              <input type="checkbox" v-model="form.es_capitan" id="capitan"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="capitan" class="ml-2 block text-sm text-gray-700">
                Es capitán del equipo
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="close"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
              {{ isEditing ? 'Actualizar' : 'Agregar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  jugador: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nombre: '',
  apellido: '',
  numero_camiseta: '',
  posicion: '',
  estatura: '',
  fecha_nacimiento: '',
  es_capitan: false
})

const isEditing = ref(false)

// Resetear formulario cuando se abre/cierra el modal
watch(() => props.show, (newVal) => {
  if (newVal && props.jugador) {
    // Si hay jugador para editar, cargar sus datos
    form.value = { 
      nombre: props.jugador.nombre || '',
      apellido: props.jugador.apellido || '',
      numero_camiseta: props.jugador.numero_camiseta || '',
      posicion: props.jugador.posicion || '',
      estatura: props.jugador.estatura || '',
      fecha_nacimiento: props.jugador.fecha_nacimiento || '',
      es_capitan: props.jugador.es_capitan || false
    }
    isEditing.value = true
  } else if (newVal && !props.jugador) {
    // Si es nuevo jugador, resetear formulario
    resetForm()
    isEditing.value = false
  }
})

const resetForm = () => {
  form.value = {
    nombre: '',
    apellido: '',
    numero_camiseta: '',
    posicion: '',
    estatura: '',
    fecha_nacimiento: '',
    es_capitan: false
  }
}

const handleSubmit = () => {
  emit('save', form.value)
}

const close = () => {
  resetForm()
  emit('close')
}
</script>