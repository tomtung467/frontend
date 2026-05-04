export function useFormatter() {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN')
  }

  const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTime,
    formatPhoneNumber,
  }
}
