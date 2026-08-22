import { BarChart2, Bookmark, BookOpen, Home, PenTool, Repeat } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Create", href: "/dashboard/create", icon: PenTool },
  { label: "Analyze", href: "/dashboard/analyze", icon: BarChart2 },
  { label: "Drafts", href: "/dashboard/drafts", icon: Bookmark },
  { label: "Repurpose", href: "/dashboard/repurpose", icon: Repeat },
  { label: "Learn", href: "/dashboard/learn", icon: BookOpen },
];

export function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "Mission Control";
  const match = NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href)
  );
  return match ? match.label : "Mission Control";
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  return pathname.startsWith(href);
}
