import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaskedInputProps {
  value: string;
  onChange: (raw: string, masked: string) => void;
  mask: (value: string) => string;
  validate?: (value: string) => boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  errorMessage?: string;
  className?: string;
  type?: string;
}

export function MaskedInput({
  value,
  onChange,
  mask,
  validate,
  placeholder,
  label,
  required,
  errorMessage = "Campo inválido",
  className,
  type = "text",
}: MaskedInputProps) {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const maskedValue = mask(value);
  const isValid = !validate || !touched || !value || validate(value);
  const showError = touched && !focused && value && !isValid;
  const showSuccess = touched && !focused && value && isValid;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const masked = mask(raw);
      onChange(raw, masked);
    },
    [mask, onChange]
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-zinc-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          type={type}
          value={maskedValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          placeholder={placeholder}
          className={cn(
            "bg-zinc-800 border-zinc-700 text-white transition-all duration-200",
            showError && "border-red-500 focus-visible:ring-red-500/20",
            showSuccess && "border-green-500 focus-visible:ring-green-500/20",
            className
          )}
        />
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      {showError && (
        <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
