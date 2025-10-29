import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/utils/validation';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validation?: (value: string) => ValidationResult;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showPasswordStrength?: boolean;
  autoComplete?: string;
  maxLength?: number;
  rows?: number;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  validation,
  required = false,
  disabled = false,
  className,
  showPasswordStrength = false,
  autoComplete,
  maxLength,
  rows = 4,
  hint,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  } | null>(null);

  // Validate on value change if field has been touched
  useEffect(() => {
    if (touched && validation) {
      const result = validation(value);
      setErrors(result.errors);
      
      // Calculate password strength if needed
      if (type === 'password' && showPasswordStrength && value) {
        import('@/utils/validation').then(({ getPasswordStrength }) => {
          setPasswordStrength(getPasswordStrength(value));
        });
      }
    }
  }, [value, touched, validation, type, showPasswordStrength]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    if (validation) {
      const result = validation(value);
      setErrors(result.errors);
    }
    onBlur?.(e);
  };

  const isValid = touched && errors.length === 0 && value.trim() !== '';
  const hasErrors = touched && errors.length > 0;

  const inputProps = {
    id,
    name,
    placeholder,
    value,
    onChange,
    onBlur: handleBlur,
    disabled,
    autoComplete,
    maxLength,
    className: cn(
      'transition-all duration-200',
      hasErrors && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      className
    ),
    'aria-invalid': hasErrors,
    'aria-describedby': hasErrors ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {maxLength && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        {type === 'textarea' ? (
          <Textarea {...inputProps} rows={rows} />
        ) : (
          <Input
            {...inputProps}
            type={type === 'password' && showPassword ? 'text' : type}
          />
        )}

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Validation status icon */}
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {type !== 'password' && (
              <>
                {hasErrors && <AlertCircle className="h-4 w-4 text-red-500" />}
                {isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
              </>
            )}
          </div>
        )}
      </div>

      {/* Password strength indicator */}
      {type === 'password' && showPasswordStrength && passwordStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password strength:</span>
            <span className={passwordStrength.color}>{passwordStrength.label}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                passwordStrength.score <= 2 && 'bg-red-500',
                passwordStrength.score > 2 && passwordStrength.score <= 4 && 'bg-yellow-500',
                passwordStrength.score > 4 && 'bg-green-500'
              )}
              style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Hint text */}
      {hint && !hasErrors && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {/* Error messages */}
      {hasErrors && (
        <div id={`${id}-error`} className="space-y-1" role="alert">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormField;