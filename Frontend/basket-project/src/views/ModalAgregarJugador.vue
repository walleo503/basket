<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
      
      <div class="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div class="absolute top-4 right-4">
          <button @click="close" class="text-gray-400 hover:text-red-500 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <svg class="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ isEditing ? 'Editar Jugador' : 'Agregar Nuevo Jugador' }}
        </h3>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" v-model="form.nombre" required placeholder="Ej: LeBron"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input type="text" v-model="form.apellido" required placeholder="Ej: James"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                <input type="number" v-model="form.numero_camiseta" required min="0" max="99"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estatura (m)</label>
                <input type="number" step="0.01" v-model="form.estatura" min="1.50" max="2.50" placeholder="Ej: 2.06"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Posición *</label>
              <select v-model="form.posicion" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="" disabled>Seleccionar posición</option>
                <option value="Base">Base (1)</option>
                <option value="Escolta">Escolta (2)</option>
                <option value="Alero">Alero (3)</option>
                <option value="Ala-pívot">Ala-pívot (4)</option>
                <option value="Pívot">Pívot (5)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" v-model="form.fecha_nacimiento"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>

            <div class="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
              <input type="checkbox" v-model="form.es_capitan" id="capitan"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer">
              <label for="capitan" class="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                Asignar como capitán del equipo
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" @click="close"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              {{ isEditing ? 'Guardar Cambios' : 'Registrar Jugador' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  jugador: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'save'])

const isEditing = computed(() => !!props.jugador)

const form = ref({
  nombre: '',
  apellido: '',
  numero_camiseta: '',
  posicion: '',
  estatura: '',
  fecha_nacimiento: '',
  es_capitan: false
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
watch(() => props.jugador, (newVal) => {
  if (newVal) {
    form.value = {
      nombre: newVal.nombre || '',
      apellido: newVal.apellido || '',
      numero_camiseta: newVal.numero_camiseta || '',
      posicion: newVal.posicion || '',
      estatura: newVal.estatura || '',
      fecha_nacimiento: newVal.fecha_nacimiento ? newVal.fecha_nacimiento.split('T')[0] : '',
      es_capitan: newVal.es_capitan || false
    }
  } else {
    resetForm()
  }
}, { immediate: true })
const handleSubmit = () => {
  const data = {
    ...form.value,
    numero_camiseta: parseInt(form.value.numero_camiseta, 10),
    estatura: form.value.estatura ? parseFloat(form.value.estatura) : null,
    fecha_nacimiento: form.value.fecha_nacimiento || null
  }
  emit('save', data)
}

const close = () => {
  resetForm()
  emit('close')
}
</script>