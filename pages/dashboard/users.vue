<script setup>
import { onMounted } from 'vue';
import { initFlowbite } from 'flowbite';

// Panggil initFlowbite saat komponen di-mount
onMounted(() => {
  initFlowbite();
});

definePageMeta({
  layout: 'dashboard'
});

const pageTitle = useState('pageTitle');
pageTitle.value = 'Manajemen Pengguna';

const config = useRuntimeConfig();
const token = useCookie('token');

// STATE UNTUK CRUD
const modal = ref(null); // Untuk referensi elemen modal
const isEditMode = ref(false);
const formData = ref({
  id: null,
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'staff',
});

const { data: users, pending, error, refresh: refreshUsers } = await useFetch('/users', {
  lazy: true,
  baseURL: config.public.apiBase,
  headers: {
    Authorization: `Bearer ${token.value}`
  },
  transform: (response) => response.data,
});

const formatRoles = (roles) => {
  if (!roles || roles.length === 0) return 'N/A';
  return roles.map(role => role.name).join(', ');
};

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'staff',
  };
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
};

const openEditModal = (user) => {
  isEditMode.value = true;
  formData.value = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    password: '',
    role: user.roles[0]?.name || 'staff',
  };
};


const handleSubmit = async () => {
  const method = isEditMode.value ? 'PUT' : 'POST';
  const url = isEditMode.value ? `/users/${formData.value.id}` : '/users';
  
  try {
    const { data: response, error } = await useFetch(url, {
      baseURL: config.public.apiBase,
      method: method,
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Accept': 'application/json',
      },
      body: formData.value,
    });

    if (error.value) {
      alert(error.value.data?.message || 'Gagal menyimpan data');
      return;
    }
    
    alert(response.value?.message || 'Data berhasil disimpan');
    await refreshUsers();

    const closeButton = document.querySelector('[data-modal-hide="user-modal"]');
    if(closeButton) closeButton.click();

  } catch (e) {
    alert('Terjadi kesalahan saat menghubungi server.');
  }
};

const deleteUser = async (userId) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
    return;
  }
  
  try {
    const { error } = await useFetch(`/users/${userId}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (error.value) {
      alert(error.value.data?.message || 'Gagal menghapus data');
      return;
    }
    
    alert('Pengguna berhasil dihapus');
    await refreshUsers(); // Muat ulang data tabel
  } catch (e) {
    alert('Terjadi kesalahan saat menghubungi server.');
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-3xl font-bold text-secondary">Daftar Pengguna</h1>
      <button @click="openAddModal" data-modal-target="user-modal" data-modal-toggle="user-modal" type="button" class="text-white bg-primary hover:scale-105 transition duration-300 ease-in-out focus:ring-4 focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5">
        Tambah Pengguna
      </button>
    </div>

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-white uppercase bg-primary">
          <tr>
            <th scope="col" class="px-6 py-3 w-16">No</th>
            <th scope="col" class="px-6 py-3">Nama Sparepart</th>
            <th scope="col" class="px-6 py-3">Username</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Role</th>
            <th scope="col" class="px-6 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="6" class="text-center py-4 text-gray-500">Memuat data pengguna...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="6" class="text-center py-4 text-red-500">Oops, terjadi kesalahan: {{ error.message }}</td>
          </tr>
          <tr v-else v-for="(user, index) in users" :key="user.id" class="odd:bg-white even:bg-gray-50 border-b">
            <td class="px-6 py-4 text-center">{{ index + 1 }}</td>
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ user.name }}</th>
            <td class="px-6 py-4">{{ user.username }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span class="bg-primary text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded">{{ formatRoles(user.roles) }}</span>
            </td>
            <td class="px-6 py-4 flex items-center space-x-2">
              <button @click="openEditModal(user)" data-modal-target="user-modal" data-modal-toggle="user-modal" type="button" class="font-medium text-yellow-400 hover:text-yellow-500">
                <Icon name="heroicons:pencil-square" class="w-5 h-5" />
              </button>
              <button @click="deleteUser(user.id)" type="button" class="font-medium text-red-600 hover:text-red-800">
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="user-modal" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
      <div class="relative p-4 w-full max-w-2xl max-h-full">
        <div class="relative bg-white rounded-lg shadow">
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}
            </h3>
            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="user-modal">
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <form @submit.prevent="handleSubmit" class="p-4 md:p-5">
            <div class="grid gap-4 mb-4 grid-cols-2">
              <div class="col-span-2">
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama Lengkap</label>
                <input v-model="formData.name" type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" required>
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label for="username" class="block mb-2 text-sm font-medium text-gray-900">Username</label>
                <input v-model="formData.username" type="text" name="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" required>
              </div>
               <div class="col-span-2 sm:col-span-1">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input v-model="formData.email" type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" required>
              </div>
              <div class="col-span-2">
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                <input v-model="formData.password" type="password" name="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" :required="!isEditMode">
                 <p v-if="isEditMode" class="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password.</p>
              </div>
              <div class="col-span-2">
                <label for="role" class="block mb-2 text-sm font-medium text-gray-900">Role</label>
                <select v-model="formData.role" id="role" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" class="text-white inline-flex items-center bg-primary hover:scale-105 transition duration-300 ease-in-out focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              <Icon name="heroicons:check-circle" class="me-1 -ms-1 w-5 h-5" />
              Simpan Data
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>