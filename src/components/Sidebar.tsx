// client/src/components/Sidebar.tsx
import { useState } from "react";
import { Menu, Home, Users, Settings, LogOut, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  role: "admin" | "user";
  onLogout: () => void;
}

const Sidebar = ({ role, onLogout }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define menu items for different roles
  const adminMenu = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/admin" },
    { name: "Manage Users", icon: <Users size={20} />, href: "/admin/users" },
    { name: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
  ];

  const userMenu = [
    { name: "Home", icon: <Home size={20} />, href: "/user" },
    { name: "My Reports", icon: <FileText size={20} />, href: "/user/reports" },
    { name: "Profile", icon: <Settings size={20} />, href: "/user/profile" },
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    // Call the logout function passed as prop
    onLogout();
    // Optionally navigate to login page
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ width: 220 }}
      animate={{ width: isOpen ? 220 : 70 }}
      className="h-screen bg-gray-900 text-gray-200 flex flex-col shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <span
          className={`font-bold text-lg whitespace-nowrap transition-all ${
            !isOpen && "hidden"
          }`}
        >
          {role === "admin" ? "Admin Panel" : "User Panel"}
        </span>
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-4 space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => handleNavigation(item.href)}
            className="flex items-center gap-3 p-3 w-full text-left rounded-md hover:bg-gray-800 transition"
          >
            {item.icon}
            <span
              className={`text-sm font-medium transition-all ${
                !isOpen && "hidden"
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 w-full rounded-md hover:bg-gray-800 transition"
        >
          <LogOut size={20} />
          <span
            className={`text-sm font-medium transition-all ${
              !isOpen && "hidden"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </motion.div>
  );
};
  
export default Sidebar;