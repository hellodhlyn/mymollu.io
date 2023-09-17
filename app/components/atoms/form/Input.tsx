type InputProps = {
  name?: string;
  placeholder?: string;
  required?: boolean;
};

export default function Input({ name, placeholder, required }: InputProps) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="my-1 mr-1 md:mr-2 p-2 border rounded-lg shadow-lg dark:shadow-neutral-500 dark:text-neutral-900"
      required={required}
    />
  );
}
