import { ref } from "vue";
import { useRouter } from "vue-router";
import { validateLogin } from "../../functions/authValidator";
import { saveAuthData } from "../../functions/authStorage";
import { loginService } from "./loginService";

export default function useLogin() {
  const router = useRouter();

  const email = ref("");
  const password = ref("");
  const loading = ref(false);
  const error = ref("");

  const handleLogin = async () => {
    error.value = validateLogin({
      email: email.value,
      password: password.value,
    });

    if (error.value) return;

    try {
      loading.value = true;

      const data = await loginService({
        email: email.value.trim(),
        password: password.value.trim(),
      });

      saveAuthData(data);
      router.push("/dashboard");
    } catch (err) {
      error.value = err?.response?.data?.message || "Đăng nhập thất bại";
    } finally {
      loading.value = false;
    }
  };

  return {
    email,
    password,
    loading,
    error,
    handleLogin,
  };
}