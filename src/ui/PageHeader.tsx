import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  actionLabel = "Novo",
  onActionClick,
  icon = <Plus size={16} />,
}: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm mb-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {onActionClick && (
        <button
          onClick={onActionClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          {icon}
          {actionLabel}
        </button>
      )}
    </div>
  );
};
