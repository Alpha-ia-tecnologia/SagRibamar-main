type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export const Button = ({ label, onClick }: ButtonProps) => (
  <button
    type="submit"
    onClick={onClick}
    className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition cursor-pointer"
  >
    {label}
  </button>
);
