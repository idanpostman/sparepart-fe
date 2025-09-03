<script setup>
import { onMounted, ref } from 'vue';
import { initFlowbite } from 'flowbite';

onMounted(() => {
  initFlowbite();
});

definePageMeta({
  layout: 'dashboard'
});

const pageTitle = useState('pageTitle');
pageTitle.value = 'Manajemen Sparepart';

const config = useRuntimeConfig();
const token = useCookie('token');

// STATE
const isEditMode = ref(false);
const formData = ref({
  id: null,
  nama_sparepart: '',
  minimal_stok: 0,
  stok: 0,
});

// Ambil data spareparts
const { data: spareparts, pending, error, refresh: refreshSpareparts } = await useFetch('/spareparts', {
  lazy: true,
  baseURL: config.public.apiBase,
  headers: {
    Authorization: token.value,
    Accept: 'application/json'
  },
  transform: (response) => response.data,
});

const resetForm = () => {
  formData.value = {
    id: null,
    nama_sparepart: '',
    minimal_stok: 0,
    stok: 0,
  };
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
};

const openEditModal = (item) => {
  isEditMode.value = true;
  formData.value = {
    id: item.id,
    nama_sparepart: item.nama_sparepart,
    minimal_stok: item.minimal_stok,
    stok: item.stok,
  };
};

const handleSubmit = async () => {
  const method = isEditMode.value ? 'PUT' : 'POST';
  const url = isEditMode.value ? `/spareparts/${formData.value.id}` : '/spareparts';

  try {
    const { data: response, error } = await useFetch(url, {
      baseURL: config.public.apiBase,
      method: method,
      headers: {
        Authorization: token.value,
        Accept: 'application/json',
      },
      body: formData.value,
    });

    if (error.value) {
      alert(error.value.data?.message || 'Gagal menyimpan data');
      return;
    }

    alert(response.value?.message || 'Data berhasil disimpan');
    await refreshSpareparts();

    const closeButton = document.querySelector('[data-modal-hide="sparepart-modal"]');
    if (closeButton) closeButton.click();
  } catch (e) {
    alert('Terjadi kesalahan saat menghubungi server.');
  }
};

const deleteSparepart = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus sparepart ini?')) return;

  try {
    const { error } = await useFetch(`/spareparts/${id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: token.value,
        Accept: 'application/json',
      },
    });

    if (error.value) {
      alert(error.value.data?.message || 'Gagal menghapus data');
      return;
    }

    alert('Sparepart berhasil dihapus');
    await refreshSpareparts();
  } catch (e) {
    alert('Terjadi kesalahan saat menghubungi server.');
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-3xl font-bold text-secondary">Daftar Sparepart</h1>
      <button
        @click="openAddModal"
        data-modal-target="sparepart-modal"
        data-modal-toggle="sparepart-modal"
        type="button"
        class="text-white bg-primary hover:scale-105 transition duration-300 ease-in-out focus:ring-4 focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Tambah Sparepart
      </button>
    </div>

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-white uppercase bg-primary">
          <tr>
            <th scope="col" class="px-6 py-3 w-16">No</th>
            <th scope="col" class="px-6 py-3">Nama Sparepart</th>
            <th scope="col" class="px-6 py-3">Minimal Stok</th>
            <th scope="col" class="px-6 py-3">Stok</th>
            <th scope="col" class="px-6 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="5" class="text-center py-4 text-gray-500">Memuat data sparepart...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="5" class="text-center py-4 text-red-500">Oops, terjadi kesalahan: {{ error.message }}</td>
          </tr>
          <tr
            v-else
            v-for="(item, index) in spareparts"
            :key="item.id"
            class="odd:bg-white even:bg-gray-50 border-b"
          >
            <td class="px-6 py-4 text-center">{{ index + 1 }}</td>
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ item.nama_sparepart }}</td>
            <td class="px-6 py-4">{{ item.minimal_stok }}</td>
            <td class="px-6 py-4">{{ item.stok }}</td>
            <td class="px-6 py-4 flex items-center space-x-2">
              <button
                @click="openEditModal(item)"
                data-modal-target="sparepart-modal"
                data-modal-toggle="sparepart-modal"
                type="button"
                class="font-medium text-yellow-400 hover:text-yellow-500"
              >
                <Icon name="heroicons:pencil-square" class="w-5 h-5" />
              </button>
              <button
                @click="deleteSparepart(item.id)"
                type="button"
                class="font-medium text-red-600 hover:text-red-800"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      id="sparepart-modal"
      tabindex="-1"
      aria-hidden="true"
      class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div class="relative p-4 w-full max-w-2xl max-h-full">
        <div class="relative bg-white rounded-lg shadow">
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Sparepart' : 'Tambah Sparepart Baru' }}
            </h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="sparepart-modal"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="p-4 md:p-5">
            <div class="grid gap-4 mb-4 grid-cols-2">
              <div class="col-span-2">
                <label for="nama_sparepart" class="block mb-2 text-sm font-medium text-gray-900">Nama Sparepart</label>
                <input
                  v-model="formData.nama_sparepart"
                  type="text"
                  id="nama_sparepart"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  required
                />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label for="minimal_stok" class="block mb-2 text-sm font-medium text-gray-900">Minimal Stok</label>
                <input
                  v-model="formData.minimal_stok"
                  type="number"
                  id="minimal_stok"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  required
                />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label for="stok" class="block mb-2 text-sm font-medium text-gray-900">Stok</label>
                <input
                  v-model="formData.stok"
                  type="number"
                  id="stok"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              class="text-white inline-flex items-center bg-primary hover:scale-105 transition duration-300 ease-in-out focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              <Icon name="heroicons:check-circle" class="me-1 -ms-1 w-5 h-5" />
              Simpan Data
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
