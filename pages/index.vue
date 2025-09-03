<script setup>
import { ref } from 'vue';
import { useCookie, useRouter, useRuntimeConfig } from '#app';

const formData = ref({
  email: '',
  password: '',
});

const passwordFieldType = ref('password');
const loginError = ref(null);
const isLoading = ref(false);

const config = useRuntimeConfig();
const router = useRouter();

const token = useCookie('token', {
  maxAge: 60 * 60 * 24 * 7, // 7 hari
});

const togglePasswordVisibility = () => {
  passwordFieldType.value =
    passwordFieldType.value === 'password' ? 'text' : 'password';
};

const handleLogin = async () => {
  isLoading.value = true;
  loginError.value = null;

  try {
    console.log('Attempting login with:', formData.value.email);
    console.log('API Base URL:', config.public.apiBase);

    const response = await $fetch('/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: formData.value,
    });

    console.log('Login response:', response);

    if (response.access_token) {
      token.value = `${response.token_type} ${response.access_token}`;

      localStorage.setItem('user', JSON.stringify(response.data));

      await router.push('/dashboard/spareparts');
    } else {
      loginError.value =
        response.message || 'Login gagal. Silakan periksa email & password.';
    }
  } catch (err) {
    console.error('Login error details:', err);

    const status = err?.response?.status;
    const data = err?.data;

    if (status === 401) {
      loginError.value = 'Email atau password salah.';
    } else if (status === 422) {
      loginError.value = data?.message || 'Data yang Anda masukkan tidak valid.';
    } else if (status >= 500) {
      loginError.value = 'Server sedang bermasalah. Silakan coba lagi nanti.';
    } else if (err.name === 'FetchError') {
      loginError.value =
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else {
      loginError.value = data?.message || err.message || 'Terjadi kesalahan.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>



<template>
  <div class="grid grid-cols-1 md:grid-cols-2 h-screen w-full overflow-hidden">
    <div class="relative hidden md:flex flex-col justify-center items-start bg-white p-12">
    <div class="mb-48">
        <h1 class="text-6xl font-bold text-secondary whitespace-nowrap"> 
            Aplikasi Manajemen <br></br> Sparepart
        </h1>
  <span class="text-lg text-secondary mt-2 block">
    Buat Semua jadi <span class="text-blue-500">Mudah</span>
  </span>
</div>
      
    <img src="/truck.png" alt="Truck" class="absolute -translate-x-32 translate-y-52 w-4/6" />
    </div>

    <div class="bg-white flex items-center justify-center p-8 -mt-32">
      <div class="w-full max-w-sm">
        <div class="text-left mb-5">
          <h2 class="text-3xl font-bold text-secondary">Log In</h2>
        </div>
        
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <div class="relative">
              <input 
                v-model="formData.email" 
                type="text" 
                name="email" 
                id="email" 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3" 
                placeholder="Enter Email" 
                required 
              />
              <button 
                v-if="formData.email" 
                @click="formData.email = ''" 
                type="button" 
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <Icon name="heroicons:x-circle-20-solid" class="w-5 h-5 text-gray-400 hover:text-gray-600"/>
              </button>
            </div>
          </div>
          <div>
            <div class="relative">
              <input 
                v-model="formData.password" 
                :type="passwordFieldType" 
                name="password" 
                id="password" 
                placeholder="••••••••" 
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3" 
                required 
              />
              <button 
                @click="togglePasswordVisibility" 
                type="button" 
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <Icon v-if="passwordFieldType === 'password'" name="heroicons:eye" class="w-5 h-5 text-gray-400 hover:text-gray-600"/>
                <Icon v-else name="heroicons:eye-slash" class="w-5 h-5 text-gray-400 hover:text-gray-600"/>
              </button>
            </div>
          </div>
          <div v-if="loginError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span class="block sm:inline">{{ loginError }}</span>
          </div>
          
          <button type="submit" :disabled="isLoading" class="w-full text-white bg-primary hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-3 text-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading">Loading...</span>
            <span v-else>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>