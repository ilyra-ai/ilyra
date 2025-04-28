import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
}

interface FormModalProps {
  title: string;
  fields: FormField[];
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const FormModal: React.FC<FormModalProps> = ({
  title,
  fields,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                  required={field.required}
                  disabled={field.disabled || isSubmitting}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                  required={field.required}
                  disabled={field.disabled || isSubmitting}
                />
              ) : (
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
                  required={field.required}
                  disabled={field.disabled || isSubmitting}
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Salvando...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
