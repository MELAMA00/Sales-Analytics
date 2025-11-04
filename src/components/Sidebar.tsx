import React from 'react';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  TrendingUp, 
  Brain,
  Home,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, theme = 'light', onToggleTheme }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Data Management', icon: Upload },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'predictive', label: 'Predictive Analytics', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Sales Analytics</h1>
            <p className="text-slate-400 text-sm">Business Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-3 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-indigo-300" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-300" />
            )}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span className={`inline-flex h-5 w-9 items-center rounded-full ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-500'}`}>
            <span className={`h-4 w-4 bg-white rounded-full transform transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-1'}`}></span>
          </span>
        </button>

        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
