"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, LogOut, Menu, ShoppingBag, User, X, LayoutDashboard, ClipboardList } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "DIVAY BEAUTY";

const navLinks = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/prestations", label: "Nos services", exact: false },
  { href: "/tarifs", label: "Tarifs", exact: false },
  { href: "/boutique", label: "Boutique", icon: true, exact: false },
  { href: "/a-propos", label: "À propos", exact: false },
  { href: "/galerie", label: "Galerie", exact: false },
  { href: "/contact", label: "Contact", exact: false },
];

type Me = { name: string; roles: string[] } | null;

export function SiteHeader() {
  const itemCount = useCart((s) => s.itemCount());
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme les menus à chaque changement de page (ajustement d'état pendant le rendu)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setDrawerOpen(false);
  }

  // Session : rechargée à chaque changement de page (connexion / déconnexion)
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { name: string }; roles?: string[] } | null) => {
        if (active) setMe(d?.user ? { name: d.user.name, roles: d.roles ?? [] } : null);
      })
      .catch(() => active && setMe(null));
    return () => {
      active = false;
    };
  }, [pathname]);

  // Ferme le menu compte au clic extérieur / Échap
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Bloque le scroll de la page quand le tiroir mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setMenuOpen(false);
    setDrawerOpen(false);
    router.push("/");
    router.refresh();
  }

  const isAdmin = !!me && (me.roles.includes("SUPER_ADMIN") || me.roles.includes("VENDEUSE"));
  const firstName = me?.name.split(" ")[0] ?? "";

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-[#f0dde6]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="flex flex-col items-center justify-center group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#c0476b]/20 scale-125" />
            <span
              className="relative font-serif text-[28px] leading-none text-[#2a1c15] group-hover:text-[#c0476b] transition-colors duration-300"
              style={{ letterSpacing: "0.08em" }}
            >
              <span className="text-[#c0476b]">D</span>
              <span className="inline-block w-[1px] h-5 bg-[#c0476b]/30 mx-0.5 align-middle" />
              <span>B</span>
            </span>
          </div>
          <span className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-[#2a1c15]/70 font-medium">
            {shopName}
          </span>
          <span
            className="text-[#c0476b]/70 leading-none"
            style={{ fontFamily: "var(--font-cursive), cursive", fontSize: "11px" }}
          >
            Sublimez votre beauté
          </span>
        </Link>

        {/* NAVIGATION (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-stone-600">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact ?? false);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition pb-0.5 ${
                  active
                    ? "text-[#c0476b] border-b-2 border-[#c0476b]"
                    : "hover:text-[#c0476b] border-b-2 border-transparent"
                }`}
              >
                {link.icon && <ShoppingBag className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {itemCount > 0 && (
            <Link href="/panier" aria-label={`Panier (${itemCount})`} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#f0dde6] text-stone-700 transition hover:border-[#c0476b]">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c0476b] text-[9px] font-bold text-white">
                {itemCount}
              </span>
            </Link>
          )}

          {/* Compte (desktop) */}
          <div className="relative hidden md:block" ref={menuRef}>
            {me ? (
              <>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 rounded-full border border-[#f0dde6] pl-2 pr-3 text-xs font-semibold text-stone-700 transition hover:border-[#c0476b]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c0476b] text-[11px] font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  {firstName}
                  <ChevronDown className={`h-3.5 w-3.5 transition ${menuOpen ? "rotate-180" : ""}`} />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-[#f0dde6] bg-white py-2 shadow-xl">
                    <p className="px-4 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Bonjour {firstName}</p>
                    {isAdmin && (
                      <Link role="menuitem" href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff0f4]">
                        <LayoutDashboard className="h-4 w-4 text-[#c0476b]" /> Espace administration
                      </Link>
                    )}
                    <Link role="menuitem" href="/compte" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff0f4]">
                      <User className="h-4 w-4 text-[#c0476b]" /> Mon espace
                    </Link>
                    <Link role="menuitem" href="/compte#commandes" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff0f4]">
                      <ClipboardList className="h-4 w-4 text-[#c0476b]" /> Mes commandes
                    </Link>
                    <Link role="menuitem" href="/compte#rendez-vous" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-[#fff0f4]">
                      <Calendar className="h-4 w-4 text-[#c0476b]" /> Mes rendez-vous
                    </Link>
                    <button role="menuitem" onClick={logout} className="flex w-full items-center gap-3 border-t border-[#f0dde6] px-4 py-2.5 text-left text-xs font-semibold text-stone-700 hover:bg-[#fff0f4]">
                      <LogOut className="h-4 w-4 text-[#c0476b]" /> Déconnexion
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/connexion" className="flex h-10 items-center gap-2 rounded-full border border-[#f0dde6] px-4 text-xs font-semibold text-stone-700 transition hover:border-[#c0476b]">
                <User className="h-4 w-4" /> Connexion
              </Link>
            )}
          </div>

          <Link
            href="/reservation"
            className="hidden items-center gap-2 rounded-full bg-[#c0476b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#9e3457] sm:flex"
          >
            <Calendar className="h-3.5 w-3.5" />
            Rendez-vous
          </Link>

          {/* Bouton menu (mobile) */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0dde6] text-stone-700 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

      {drawerOpen &&
        createPortal(
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-[#f0dde6] px-5">
              <span className="font-serif text-lg text-[#2a1c15]">{shopName}</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Fermer le menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0dde6]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => {
                const active = isActive(link.href, link.exact ?? false);
                return (
                  <Link key={link.href} href={link.href} className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-semibold ${active ? "bg-[#fff0f4] text-[#c0476b]" : "text-stone-700"}`}>
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-3 border-t border-[#f0dde6]" />
              {me ? (
                <>
                  {isAdmin && <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-stone-700"><LayoutDashboard className="h-4 w-4 text-[#c0476b]" /> Espace administration</Link>}
                  <Link href="/compte" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-stone-700"><User className="h-4 w-4 text-[#c0476b]" /> Mon espace</Link>
                  <Link href="/compte#commandes" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-stone-700"><ClipboardList className="h-4 w-4 text-[#c0476b]" /> Mes commandes</Link>
                  <Link href="/compte#rendez-vous" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-stone-700"><Calendar className="h-4 w-4 text-[#c0476b]" /> Mes rendez-vous</Link>
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold text-stone-700"><LogOut className="h-4 w-4 text-[#c0476b]" /> Déconnexion</button>
                </>
              ) : (
                <Link href="/connexion" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-stone-700"><User className="h-4 w-4 text-[#c0476b]" /> Connexion / Inscription</Link>
              )}
            </nav>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
