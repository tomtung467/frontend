import { loginApi } from "../../functions/authApi";

export const loginService = async ({ email, password }) => {
  return await loginApi({ email, password });
};