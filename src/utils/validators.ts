export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]{9}$/
  return phoneRegex.test(phone)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

export const isValidCode = (code: string): boolean => {
  return /^[A-Z0-9-]+$/.test(code)
}

export const isValidQuantity = (quantity: number): boolean => {
  return !isNaN(quantity) && quantity >= 0
}