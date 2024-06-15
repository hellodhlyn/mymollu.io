import { sanitizeClassName } from "~/prophandlers";

type TextareaProps = {
  className?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  onChange?: (value: string) => void;
};

export default function Textarea({
  className, name, label, description, placeholder, required, defaultValue, error, onChange,
}: TextareaProps) {
  return (
    <div className="mt-2 mb-8 last:mb-4 mr-1 md:mr-2">
      {label && <p className="font-bold my-2">{label}</p>}
      {description && <p className="my-2 text-sm text-neutral-500">{description}</p>}
      <textarea
        name={name}
        placeholder={placeholder}
        className={sanitizeClassName(`
          h-24 md:h-32 w-full p-2 border rounded-lg shadow-lg dark:shadow-neutral-500 dark:text-neutral-900 transition
          ${error ? "border-red-300 shadow-red-300" : ""}
          ${className ?? ""}
        `)}
        required={required}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
