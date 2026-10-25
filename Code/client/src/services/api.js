// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to attach JWT token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('staffsync_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for token expiry handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Clear token if invalid or expired (except on login attempt)
//       if (!error.config.url.includes('/auth/login')) {
//         localStorage.removeItem('staffsync_token');
//         localStorage.removeItem('staffsync_user');
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;




// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Attach JWT token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('staffsync_token');

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle expired token
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !error.config.url.includes('/auth/login')
//     ) {
//       localStorage.removeItem('staffsync_token');
//       localStorage.removeItem('staffsync_user');
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;





// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || '/api';

// console.log('StaffSync API URL:', API_URL);

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('staffsync_token');

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !error.config.url.includes('/auth/login')
//     ) {
//       localStorage.removeItem('staffsync_token');
//       localStorage.removeItem('staffsync_user');
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;





import axios from 'axios';

const api = axios.create({
  baseURL: 'https://staffsync-backend-hm47.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth/login')
    ) {
      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
    }

    return Promise.reject(error);
  }
);

export default api;
