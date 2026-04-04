export const validateLogin = ({ email, password }) => {
  if (!email?.trim() || !password?.trim()) {
    return "Vui lòng nhập đầy đủ email và mật khẩu";
  }
  return "";
};

export const validateRegister = ({
  fullName,
  email,
  password,
  confirmPassword,
}) => {
  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !confirmPassword?.trim()
  ) {
    return "Vui lòng nhập đầy đủ thông tin";
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }

  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp";
  }

  return "";
};