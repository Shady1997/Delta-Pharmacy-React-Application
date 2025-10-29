// FILE: src/utils/validators.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  if (!phone || !phoneRegex.test(phone)) {
    return { valid: false, message: 'Invalid phone number' };
  }
  return { valid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return { valid: false, message: 'Price must be a positive number' };
  }
  return { valid: true };
};

export const validateStock = (stock) => {
  const numStock = parseInt(stock);
  if (isNaN(numStock) || numStock < 0) {
    return { valid: false, message: 'Stock must be a positive number' };
  }
  return { valid: true };
};