import React from 'react';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  TrendingUp, 
  Brain,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'upload', label: 'Upload Data', icon: Upload },
  { id: 'reporting', label: 'Reporting', icon: FileText },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'analytics', label: 'Predictive Analytics', icon: Brain },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <BarChart3 size={32} className="text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Sales Analytics</h1>
            <p className="text-sm text-gray-400">BI Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 hover:bg-gray-800 ${
                activeSection === item.id 
                  ? 'bg-blue-600 border-r-4 border-blue-400' 
                  : ''
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <p>© 2025 Sales Analytics</p>
          <p>Professional BI System</p>
        </div>
      </div>
    </div>
  );
}