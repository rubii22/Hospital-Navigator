"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  MapPin,
  DoorOpen,
  Compass,
  GitBranch,
  Cpu,
  Sparkles,
  History,
  Package,
  Users,
  ScrollText,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Hospital as HospitalIcon,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Hospitals", href: "/hospitals", icon: <HospitalIcon size={18} /> },
  { label: "Buildings", href: "/buildings", icon: <Building2 size={18} /> },
  { label: "Floors", href: "/floors", icon: <Layers size={18} /> },
  { label: "Departments", href: "/departments", icon: <Layers size={18} /> },
  { label: "Rooms", href: "/rooms", icon: <DoorOpen size={18} /> },
  { label: "POIs", href: "/pois", icon: <MapPin size={18} /> },
  { label: "Map Editor", href: "/map-editor", icon: <Compass size={18} /> },
  {
    label: "Navigation Graph",
    href: "/navigation-graph",
    icon: <GitBranch size={18} />,
  },
  { label: "Mapping Jobs", href: "/mapping-jobs", icon: <Cpu size={18} /> },
  { label: "AI Results", href: "/ai-results", icon: <Sparkles size={18} /> },
  { label: "Map Versions", href: "/map-versions", icon: <History size={18} /> },
  { label: "NAVPACKs", href: "/navpacks", icon: <Package size={18} /> },
  { label: "Users & Permissions", href: "/users", icon: <Users size={18} /> },
  {
    label: "Activity Logs",
    href: "/activity-logs",
    icon: <ScrollText size={18} />,
  },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-[var(--color-bg-app)] w-screen h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border-subtle bg-[var(--color-bg-sidebar)] transition-all duration-300 z-30 ${
          collapsed ? "w-18" : "w-64"
        }`}
      >
        {/* Brand */}
        <div className="flex justify-between items-center px-4 py-4 border-border-subtle border-b">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex justify-center items-center shadow-md rounded-lg w-8 h-8 text-white bg-[var(--color-accent-primary)] shrink-0">
              <Compass size={18} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-[var(--color-text-heading)] text-sm leading-tight">
                  Hospital Navigator
                </span>
                <span className="font-medium text-[10px] text-[var(--color-text-muted)]">
                  Admin Control Panel
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-[var(--color-bg-surface)] p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--color-accent-primary)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-3 border-border-subtle border-t">
          <div className="flex justify-between items-center bg-[var(--color-bg-card)] p-2 border border-border-subtle rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex justify-center items-center rounded-full w-8 h-8 font-semibold text-white text-xs bg-[var(--color-accent-indigo)] shrink-0">
                {user?.full_name?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              {!collapsed && (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-[var(--color-text-heading)] text-xs truncate">
                    {user?.full_name || "Admin"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--color-status-active-text)] truncate">
                    <ShieldCheck size={10} />{" "}
                    {user?.is_superuser ? "Super Admin" : "Staff"}
                  </span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="hover:bg-[var(--color-bg-surface)] p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-status-danger-text)] transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex justify-between items-center bg-[var(--color-bg-sidebar)] px-6 border-border-subtle border-b h-14 shrink-0">
          <div className="relative w-80">
            <Search
              size={15}
              className="top-1/2 left-3 absolute text-[var(--color-text-muted)] -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search hospitals, rooms, nodes..."
              className="bg-[var(--color-bg-surface)] py-1.5 pr-3 pl-9 border border-border-subtle focus:border-[var(--color-border-focus)] rounded-lg outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-hover)] p-2 border border-border-subtle rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
              <Bell size={15} />
              <span className="top-1.5 right-1.5 absolute rounded-full w-1.5 h-1.5 bg-[var(--color-accent-primary)]" />
            </button>
          </div>
        </header>

        {/* View Port */}
        <main className="flex-1 bg-[var(--color-bg-app)] p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
