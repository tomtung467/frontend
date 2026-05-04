export function useValidation() {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  const validatePassword = (password) => {
    // At least 6 characters
    return password.length >= 6
  }

  const validateRequired = (value) => {
    return value && value.trim().length > 0
  }

  const validateMinLength = (value, length) => {
    return value && value.length >= length
  }

  const validateMaxLength = (value, length) => {
    return value && value.length <= length
  }

  return {
    validateEmail,
    validatePhone,
    validatePassword,
    validateRequired,
    validateMinLength,
    validateMaxLength,
  }
}
