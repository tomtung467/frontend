import { registerApi } from "../../functions/authApi";

export const registerService = async ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  return await registerApi({
    fullName,
    email,
    password,
    confirmPassword,
  });
};