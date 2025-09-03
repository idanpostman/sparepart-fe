<script setup>
const pageTitle = useState('pageTitle', () => 'Dashboard');
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    
    <aside class="w-72 flex-shrink-0 bg-secondary text-white flex flex-col">
      <div class="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        TCB SPAREPART
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink to="/dashboard/spareparts" class="flex items-center px-4 py-2 rounded-md hover:bg-primary">
          <Icon name="heroicons:wrench-screwdriver" class="w-6 h-6 mr-3" />
          <span>Manajemen Sparepart</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/users" class="flex items-center px-4 py-2 rounded-md hover:bg-primary">
          <Icon name="heroicons:users" class="w-6 h-6 mr-3" />
          <span>Manajemen User</span>
        </NuxtLink>
        <NuxtLink to="/dashboard/transaksi" class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700">
          <Icon name="heroicons:arrow-path" class="w-6 h-6 mr-3" />
          <span>Transaksi</span>
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <a href="#" class="flex items-center px-4 py-2 rounded-md hover:bg-red-700">
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-6 h-6 mr-3" />
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b flex items-center px-6">
        <h1 class="text-xl font-semibold">{{ pageTitle }}</h1>
      </header>

      <div class="flex-1 p-6 overflow-y-auto">
        <slot />
      </div>
    </main>

  </div>
</template>