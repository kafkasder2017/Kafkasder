// Input validation utilities for security

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// TC Kimlik No validation
export const validateTCKimlik = (tcKimlik: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!tcKimlik) {
    errors.push('TC Kimlik numarası gereklidir');
    return { isValid: false, errors };
  }
  
  // Remove spaces and non-numeric characters
  const cleaned = tcKimlik.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    errors.push('TC Kimlik numarası 11 haneli olmalıdır');
  }
  
  if (cleaned[0] === '0') {
    errors.push('TC Kimlik numarası 0 ile başlayamaz');
  }
  
  // TC Kimlik algorithm validation
  if (cleaned.length === 11) {
    const digits = cleaned.split('').map(Number);
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    const check1 = (sum1 * 7 - sum2) % 10;
    const check2 = (sum1 + sum2 + digits[9]) % 10;
    
    if (check1 !== digits[9] || check2 !== digits[10]) {
      errors.push('Geçersiz TC Kimlik numarası');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('E-posta adresi gereklidir');
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Geçerli bir e-posta adresi giriniz');
  }
  
  if (email.length > 254) {
    errors.push('E-posta adresi çok uzun');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Telefon numarası gereklidir');
    return { isValid: false, errors };
  }
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Turkish phone number format
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  if (!phoneRegex.test(cleaned)) {
    errors.push('Geçerli bir telefon numarası giriniz (05XXXXXXXXX)');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Amount validation
export const validateAmount = (amount: string | number): ValidationResult => {
  const errors: string[] = [];
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    errors.push('Geçerli bir tutar giriniz');
    return { isValid: false, errors };
  }
  
  if (numAmount < 0) {
    errors.push('Tutar negatif olamaz');
  }
  
  if (numAmount > 1000000) {
    errors.push('Tutar çok yüksek');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Text input sanitization
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};

// SQL injection prevention
export const sanitizeForSQL = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// Password strength validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Şifre gereklidir');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }
  
  return { isValid: errors.length === 0, errors };
};

// File upload validation
export const validateFile = (file: File, allowedTypes: string[], maxSize: number): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('Dosya seçiniz');
    return { isValid: false, errors };
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Desteklenen dosya türleri: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    errors.push(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Date validation
export const validateDate = (date: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!date) {
    errors.push('Tarih gereklidir');
    return { isValid: false, errors };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    errors.push('Geçerli bir tarih giriniz');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// XSS prevention
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().replace(/[<>"'&]/g, (match) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

// XSS prevention
export const preventXSS = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '');
};