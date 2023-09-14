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
      className="mr-2 p-2 border rounded-lg"
      required={required}
    />
  );
}
