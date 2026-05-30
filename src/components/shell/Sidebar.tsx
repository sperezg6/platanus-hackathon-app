"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronsUpDown, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navFooter, navGroups } from "@/lib/nav";
import { useShell } from "./ShellContext";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Shared nav body, rendered inside both the desktop aside and the mobile drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/timeless-mark.png"
          alt="Timeless"
          className="size-7 shrink-0 object-contain"
        />
        <span className="text-[17px] font-bold tracking-tight">Timeless</span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-mute">
          QA
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && <p className="text-overline px-2 pb-2 pt-1">{group.label}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                const depth = item.depth ?? 0;
                const indentUnit = 16;
                return (
                  <li key={item.href} className="relative">
                    {/* Tree rails — one vertical guide per ancestor level. */}
                    {Array.from({ length: depth }).map((_, k) => (
                      <span
                        key={k}
                        aria-hidden
                        className="absolute bottom-0 top-0 w-px bg-line"
                        style={{ left: 8 + k * indentUnit + 7 }}
                      />
                    ))}
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      style={{ paddingLeft: 8 + depth * indentUnit }}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-md py-1.5 pr-2 text-sm transition-colors duration-150",
                        active
                          ? "font-medium text-ink"
                          : "text-mute hover:bg-surface-2 hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-md bg-surface-2"
                          transition={{ type: "spring", stiffness: 520, damping: 42 }}
                        />
                      )}
                      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                      {item.badge != null && (
                        <span className="ml-auto rounded bg-surface-2 px-1.5 text-[11px] text-mute">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-line px-3 py-3">
        <ul className="mb-3 space-y-0.5">
          {navFooter.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150",
                    active
                      ? "bg-surface-2 font-medium text-ink"
                      : "text-mute hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Theme toggle (visual only for now) */}
        <div className="mb-3 flex items-center justify-center gap-1 rounded-md border border-line p-1">
          <button className="grid size-7 place-items-center rounded bg-surface-2 text-ink transition-transform duration-150 active:scale-90">
            <Sun className="size-3.5" strokeWidth={1.75} />
          </button>
          <button className="grid size-7 place-items-center rounded text-faint transition-colors hover:text-ink active:scale-90">
            <Moon className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Workspace card */}
        <button className="flex w-full items-center gap-2.5 rounded-md border border-line px-2 py-2 text-left transition-colors hover:bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/timeless-mark.png"
            alt="Timeless"
            className="size-7 shrink-0 rounded-md border border-line object-contain p-0.5"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">Timeless</span>
            <span className="block truncate text-[11px] text-mute">Workspace demo</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-faint" strokeWidth={1.75} />
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { navOpen, setNavOpen } = useShell();
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Desktop: static rail */}
      <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile: slide-out drawer + backdrop */}
      <AnimatePresence>
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-overlay-ink backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[min(17rem,85vw)] flex-col border-r border-line bg-surface shadow-xl"
              initial={{ x: reduceMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
            >
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setNavOpen(false)}
                className="absolute right-3 top-4 grid size-8 place-items-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
              <SidebarContent onNavigate={() => setNavOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
