type InputProps = {
  name?: string;
  placeholder?: string;
};

export default function Input({ name, placeholder }: InputProps) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="p-2 border rounded-lg"
    />
  );
}
