export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

// Professional validation messages for insurance platform
export const ValidationMessages = {
  required: (field: string) => `${field} is required to proceed`,
  email: 'Please enter a valid email address (e.g., john@example.com)',
  phone: 'Please enter a valid phone number (e.g., +250 788 123 456)',
  password: {
    minLength: 'Password must be at least 8 characters long',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number',
    special: 'Password must contain at least one special character (!@#$%^&*)',
    weak: 'Password is too weak. Please use a stronger combination'
  },
  passwordMatch: 'Passwords do not match. Please ensure both passwords are identical',
  name: {
    invalid: 'Name must contain only letters and spaces',
    minLength: 'Name must be at least 2 characters long',
    maxLength: 'Name cannot exceed 50 characters'
  },
  terms: 'You must accept the terms and conditions to continue',
  otp: 'Please enter the 6-digit verification code sent to your email',
  general: {
    invalid: 'Please enter a valid value',
    tooShort: (min: number) => `Must be at least ${min} characters`,
    tooLong: (max: number) => `Cannot exceed ${max} characters`
  }
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push(ValidationMessages.required('Email address'));
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push(ValidationMessages.email);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Phone validation (Rwanda format)
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone.trim()) {
    errors.push(ValidationMessages.required('Phone number'));
  } else {
    // Rwanda phone format: +250 7XX XXX XXX or 07XX XXX XXX
    const phoneRegex = /^(\+250|0)?[7][0-9]{8}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push(ValidationMessages.phone);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push(ValidationMessages.required('Password'));
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push(ValidationMessages.password.minLength);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push(ValidationMessages.password.uppercase);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push(ValidationMessages.password.lowercase);
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push(ValidationMessages.password.number);
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(ValidationMessages.password.special);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!confirmPassword) {
    errors.push(ValidationMessages.required('Password confirmation'));
  } else if (password !== confirmPassword) {
    errors.push(ValidationMessages.passwordMatch);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Name validation
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push(ValidationMessages.required(fieldName));
  } else {
    if (name.trim().length < 2) {
      errors.push(ValidationMessages.name.minLength);
    }
    
    if (name.trim().length > 50) {
      errors.push(ValidationMessages.name.maxLength);
    }
    
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.push(ValidationMessages.name.invalid);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!otp.trim()) {
    errors.push(ValidationMessages.required('Verification code'));
  } else if (!/^\d{6}$/.test(otp.trim())) {
    errors.push(ValidationMessages.otp);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Terms acceptance validation
export const validateTermsAcceptance = (accepted: boolean): ValidationResult => {
  const errors: string[] = [];
  
  if (!accepted) {
    errors.push(ValidationMessages.terms);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Generic field validation
export const validateField = (value: string, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (rule.required && !value.trim()) {
      errors.push(rule.message);
      break; // If required and empty, no need to check other rules
    }
    
    if (value.trim() && rule.minLength && value.length < rule.minLength) {
      errors.push(rule.message);
    }
    
    if (value.trim() && rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.message);
    }
    
    if (value.trim() && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message);
    }
    
    if (value.trim() && rule.custom && !rule.custom(value)) {
      errors.push(rule.message);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Form validation utility
export const validateForm = (formData: Record<string, any>, validationSchema: FieldValidation): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldRules = validationSchema[fieldName];
    const result = validateField(fieldValue, fieldRules);
    
    if (!result.isValid) {
      errors[fieldName] = result.errors;
    }
  });
  
  return errors;
};

// Password strength calculator
export const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
  if (score <= 4) return { score, label: 'Medium', color: 'text-yellow-500' };
  return { score, label: 'Strong', color: 'text-green-500' };
};