import { Plus, UserPlus, BarChart3, Coins } from "lucide-react";

interface QuickActionsProps {
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function QuickActions({
  onNavigate,
}: QuickActionsProps) {
  return (
    <div id="quick-actions-bar" className="flex flex-wrap items-center gap-3">
      {/* Create Invoice Button (Primary, Blue) */}
      <button
        id="btn-quick-create-invoice"
        onClick={() => onNavigate("create-invoice")}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4 text-white stroke-[2.5]" />
        <span>Create Invoice</span>
      </button>

      {/* Add Client Button (Outlined) */}
      <button
        id="btn-quick-add-client"
        onClick={() => onNavigate("add-client")}
        className="flex items-center gap-2 border border-grey-300 hover:border-grey-400 bg-white text-grey-700 hover:text-grey-900 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
      >
        <UserPlus className="w-4 h-4 text-grey-500" />
        <span>Add Client</span>
      </button>

      {/* View Reports Button (Ghost) */}
      <button
        id="btn-quick-view-reports"
        onClick={() => onNavigate("reports")}
        className="flex items-center gap-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
      >
        <BarChart3 className="w-4 h-4 text-grey-440" />
        <span>View Reports</span>
      </button>
    </div>
  );
}
