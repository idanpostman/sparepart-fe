<script setup>
// Terapkan layout dashboard
definePageMeta({
  layout: 'dashboard'
});

// Panggil state 'pageTitle' yang sama
const pageTitle = useState('pageTitle');

// Atur nilainya untuk halaman ini
pageTitle.value = 'Manajemen Permintaan Spare Part';
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-secondary">Daftar Permintaan Spare Part</h1>
    <p class="mt-2 text-gray-600">
      Tabel data permintaan spare part akan ditampilkan di sini.
    </p>
  </div>
</template>