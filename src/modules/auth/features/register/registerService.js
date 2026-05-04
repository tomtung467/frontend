import { registerApi } from "../../functions/authApi";

export const registerService = async ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  return await registerApi({
    name: fullName,
    email,
    password,
    password_confirmation: confirmPassword,
  });
};