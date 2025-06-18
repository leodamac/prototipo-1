import { DashboardWidget as WidgetType } from '../../types/inventory';

interface DashboardWidgetProps {
  widget: WidgetType;
  title: string;
  children: React.ReactNode;
}

export const DashboardWidget = ({ widget, title, children }: DashboardWidgetProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
};