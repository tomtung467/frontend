import { ref } from "vue";
import { useRouter } from "vue-router";
import { validateRegister } from "../../functions/authValidator";
import { registerService } from "./registerService";

export default function useRegister() {
  const router = useRouter();

  const fullName = ref("");
  const email = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const loading = ref(false);
  const error = ref("");

  const handleRegister = async () => {
    error.value = validateRegister({
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });

    if (error.value) return;

    try {
      loading.value = true;

      await registerService({
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        password: password.value.trim(),
        confirmPassword: confirmPassword.value.trim(),
      });

      alert("Đăng ký thành công");
      router.push("/login");
    } catch (err) {
      error.value = err?.response?.data?.message || "Đăng ký thất bại";
    } finally {
      loading.value = false;
    }
  };

  return {
    fullName,
    email,
    password,
    confirmPassword,
    loading,
    error,
    handleRegister,
  };
}