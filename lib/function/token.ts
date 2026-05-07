export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = async (token: string) => {
  localStorage.setItem("token", token);
};

export async function logoutUser() {
    try {
      await localStorage.removeItem('token');
    //   router.replace('/login');
      // console.log('Berhasil logout, semua data login dihapus');
    } catch (error) {
      // console.error('Gagal logout:', error);
    }
  }