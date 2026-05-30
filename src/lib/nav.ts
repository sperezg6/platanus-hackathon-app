import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Bot,
  Building2,
  LayoutGrid,
  MonitorPlay,
  Settings,
  ListChecks,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  /** Indentation level used to visualize the entity hierarchy in the sidebar. */
  depth?: number;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

/**
 * Nav ordered to mirror the product's hierarchy:
 *   Cliente → Aplicaciones → Agentes  (Estructura)
 * and then the work those agents produce:
 *   Ejecuciones → Vista en vivo  (Actividad)
 * The `depth` on the Estructura items renders an indented tree guide so the
 * "a client has apps, an app has agents" containment reads at a glance.
 */
export const navGroups: NavGroup[] = [
  {
    items: [{ label: "Inicio", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "Estructura",
    items: [
      { label: "Clientes", href: "/clients", icon: Building2, depth: 0 },
      { label: "Aplicaciones", href: "/apps", icon: AppWindow, depth: 1 },
      { label: "Agentes", href: "/agents", icon: Bot, depth: 2 },
    ],
  },
  {
    label: "Actividad",
    items: [
      { label: "Ejecuciones", href: "/runs", icon: ListChecks },
      { label: "Vista en vivo", href: "/live", icon: MonitorPlay },
    ],
  },
];

export const navFooter: NavItem[] = [
  { label: "Configuración", href: "/settings", icon: Settings },
];
