type InputProps = {
  type: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Input = ({ type, placeholder, value, onChange }: InputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 rounded-md bg-accent-50 focus:outline-none focus:ring-2 focus:ring-accent-500"
  />
);
