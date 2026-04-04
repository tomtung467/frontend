export const saveAuthData = (data) => {
  if (data?.token) {
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