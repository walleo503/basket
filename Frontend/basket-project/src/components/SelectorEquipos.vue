<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">Mis Equipos</h3>
      <button @click="$emit('crear')" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
        + Nuevo Equipo
      </button>
    </div>
    
    <div class="mt-3 space-y-2">
      <div v-for="equipo in equipos" :key="equipo.id_equipo" 
           class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
           :class="{ 'bg-indigo-50 border border-indigo-200': equipo.id_equipo === equipoSeleccionado }"
           @click="$emit('seleccionar', equipo.id_equipo)">
        
        <div class="flex items-center space-x-3">
          <div :class="equipo.activo ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
          <div>
            <p class="font-medium text-gray-900">{{ equipo.nombre_oficial }}</p>
            <p class="text-xs text-gray-500">{{ equipo.siglas }} · {{ equipo.clasificacion || 'General' }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <span v-if="!equipo.activo" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Inactivo
          </span>
          <button @click.stop="$emit('toggle-estado', equipo)" 
                  :class="equipo.activo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'">
            <svg v-if="equipo.activo" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="equipos.length === 0" class="text-center py-4 text-gray-500">
        No tienes equipos registrados
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  equipos: Array,
  equipoSeleccionado: Number
})

defineEmits(['seleccionar', 'crear', 'toggle-estado'])
</script>