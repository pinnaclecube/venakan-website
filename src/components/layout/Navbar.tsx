import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import logoMark from "@/assets/venakan-logo.png";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 55);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "AI R&D", path: "/rd" },
    { label: "AI Strategy", path: "/strategy" },
    { label: "AI Training", path: "/training" },
    { label: "AI Dev", path: "/development" },
    { label: "AI Staffing", path: "/staffing" },
    { label: "Resources", path: "/resources" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(6,7,15,0.88)] backdrop-blur-[24px] border-b border-[rgba(238,242,255,0.06)] py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container flex items-center justify-between">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Venakan">
            <img
              src={logoMark}
              alt="Venakan"
              style={{
                height: "42px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 0 8px rgba(96,165,250,0.35))"
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-bright bg-[rgba(59,75,204,0.12)] rounded-md"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center">
            <Link href="/contact" className="btn-primary py-2.5 px-6 text-sm">
              Let's Talk AI &rarr;
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[999] bg-navy/95 backdrop-blur-xl transition-opacity duration-300 lg:hidden flex flex-col justify-center items-center ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-2xl font-display font-bold text-white hover:text-brand-blue transition-colors"
              style={{
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="btn-primary mt-8"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.4s ease ${navLinks.length * 0.05}s, transform 0.4s ease ${navLinks.length * 0.05}s`
            }}
          >
            Let's Talk AI &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
