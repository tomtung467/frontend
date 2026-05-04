export const saveAuthData = (data) => {
  // Salvar token com a chave correta
  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  } else if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};