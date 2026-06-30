// // lib/function/authHelper.ts

// type UserData = {
//   token: string;
//   refresh?: string;
//   user: {
//     id: number;
//     username: string;
//     nama_lengkap: string;
//     email: string;
//     kelas: string;
//     is_staff: boolean;
//   };
//   timestamp: number;
// };

// /**
//  * Ambil data user dari localStorage
//  */
// export const getUserData = (): UserData | null => {
//   if (typeof window === 'undefined') return null; // SSR check

//   const data = localStorage.getItem('user_data');
//   if (!data) return null;

//   try {
//     const parsed: UserData = JSON.parse(data);
//     return parsed;
//   } catch {
//     return null;
//   }
// };

// /**
//  * Ambil token dari localStorage
//  */
// export const getToken = (): string | null => {
//   const data = getUserData();
//   return data?.token || null;
// };

// /**
//  * Cek apakah user sudah login
//  */
// export const isLoggedIn = (): boolean => {
//   const data = getUserData();
//   if (!data) return false;

//   // Cek expiry (24 jam)
//   const now = new Date().getTime();
//   const expired = data.timestamp + 24 * 60 * 60 * 1000; // 24 jam

//   if (now > expired) {
//     logout(); // Auto logout kalau expired
//     return false;
//   }

//   return true;
// };

// /**
//  * Cek apakah user adalah admin
//  */
// export const isAdmin = (): boolean => {
//   const data = getUserData();
//   return data?.user?.is_staff || false;
// };

// /**
//  * Logout - hapus data dari localStorage
//  */
// export const logout = () => {
//   if (typeof window === 'undefined') return;
  
//   localStorage.removeItem('user_data');
//   window.location.href = '/login'; // redirect ke login
// };

// /**
//  * Update data user di localStorage (kalau ada perubahan)
//  */
// export const updateUserData = (newData: Partial<UserData>) => {
//   const current = getUserData();
//   if (current) {
//     const updated = { ...current, ...newData };
//     localStorage.setItem('user_data', JSON.stringify(updated));
//   }
// };

// /**
//  * Cek apakah user sudah tes
//  */
// export const isSudahTes = (): boolean => {
//   const data = getUserData();
//   return data?.user?.sudah_tes || false;
// };