import { useState } from "react";

export interface IValidation {
  [key: string]: {
    is_required: boolean;
    error_message: string;
    min_length?: number;
    max_length?: number;
    pattern?: RegExp;
  };
}

interface useFormProps<T> {
  defaultValues: T;
  defaultValidation: IValidation;
  onSubmit: (data: T) => void | Promise<void>;
}

export default function useForm<T extends Record<string, any>>({
  defaultValues,
  defaultValidation,
  onSubmit,
}: useFormProps<T>) {
  const [form, setForm] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validations] = useState<IValidation>(defaultValidation);

  const validateField = (name: string, value: any): string => {
    const validation = validations[name];
    if (!validation) return "";

    if (
      validation.is_required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return validation.error_message;
    }

    if (
      validation.min_length &&
      typeof value === "string" &&
      value.length < validation.min_length
    ) {
      return `Minimum ${validation.min_length} characters required`;
    }

    if (
      validation.max_length &&
      typeof value === "string" &&
      value.length > validation.max_length
    ) {
      return `Maximum ${validation.max_length} characters allowed`;
    }

    if (
      validation.pattern &&
      typeof value === "string" &&
      !validation.pattern.test(value)
    ) {
      return validation.error_message;
    }

    return "";
  };

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validations).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await onSubmit(form);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }
  };

  return {
    form,
    errors,
    validations,
    handleChange,
    handleSubmit,
    validateForm,
    setForm,
    setErrors,
  };
}
