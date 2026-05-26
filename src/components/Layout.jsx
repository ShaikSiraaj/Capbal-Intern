import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BookMarked, LayoutDashboard, Library, Sparkles, BarChart3, Mic, Layers, LogOut, GraduationCap, User, KeyRound, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabase";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "Library", icon: Library },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/voice-qa", label: "Voice Q&A", icon: Mic },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/exam-prep", label: "Exam Prep", icon: GraduationCap },
];

function ProfileMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const menuRef = useRef(null);

  const username = user?.email?.split("@")[0] || "User";
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    setPwLoading(true); setPwError(""); setPwMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwMessage("Password updated successfully!");
      setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setShowPasswordModal(false); setPwMessage(""); }, 2000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{username}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-border/60 bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => { setShowPasswordModal(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
              >
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                Change Password
              </button>
              <div className="h-px bg-border/60 mx-3 my-1" />
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="font-serif text-xl font-semibold mb-1">Change Password</h2>
            <p className="text-sm text-muted-foreground mb-5">Enter your new password below</p>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required minLength={6}
              />
              {pwError && <p className="text-xs text-destructive">{pwError}</p>}
              {pwMessage && <p className="text-xs text-green-600">{pwMessage}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPwError(""); setPwMessage(""); setNewPassword(""); setConfirmPassword(""); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background paper-grain">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookMarked className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg font-semibold tracking-tight">Mine</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Study Atelier</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <NavLink key={n.to} to={n.to}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  {n.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/library?upload=1"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-all shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Material</span>
            </Link>
            <ProfileMenu user={user} logout={logout} />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <NavLink key={n.to} to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                  <Icon className="w-3 h-3" />
                  {n.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-serif italic">
            "The mind is not a vessel to be filled, but a fire to be kindled."
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Mine · Educational AI
          </p>
        </div>
      </footer>
    </div>
  );
}