type InputProps = {
  className?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
};

export default function Input({
  className, name, label, description, placeholder, required, onChange,
}: InputProps) {
  return (
    <div className="mt-4 mb-8 last:mb-4 mr-1 md:mr-2">
      {label && <p className="font-bold my-2">{label}</p>}
      {description && <p className="my-2 text-sm text-neutral-500">{description}</p>}
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className={`
          w-48 md:w-64 max-w-full p-2 border rounded-lg shadow-lg
          dark:shadow-neutral-500 dark:text-neutral-900 ${className ?? ""}
        `}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
