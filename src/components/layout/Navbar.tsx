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
        className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        style={
          scrolled
            ? {
                height: "56px",
                background: "rgba(15,23,42,0.97)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
              }
            : {
                height: "56px",
                background: "rgba(15,23,42,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }
        }
      >
        <div className="container flex items-center justify-between" style={{ height: "56px" }}>
          <div className="flex items-center" style={{ height: "56px" }}>
            <Link href="/" className="shrink-0 flex items-center" aria-label="Venakan">
              <img
                src={logoMark}
                alt="Venakan"
                style={{
                  height: "28px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </Link>

            {/* Vertical separator between logo and nav links */}
            <span
              aria-hidden="true"
              className="hidden lg:block"
              style={{
                width: "1px",
                height: "20px",
                background: "rgba(255,255,255,0.12)",
                margin: "0 32px",
              }}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center" style={{ height: "56px" }}>
            {navLinks.map((link) => {
              const isActive = location === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className="flex items-center transition-colors"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--white)" : "var(--text-3)",
                    background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                    padding: "0 14px",
                    height: "56px",
                    borderLeft: "1px solid var(--border)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center" style={{ height: "56px" }}>
            <Link
              href="/contact"
              className="flex items-center transition-colors"
              style={{
                background: "var(--brand-blue)",
                color: "#FFFFFF",
                fontFamily: "var(--mono)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0 20px",
                height: "56px",
                borderLeft: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2D3DB8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-blue)")}
            >
              Let's Talk AI &rarr;
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2"
            style={{ color: "var(--white)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[999] transition-opacity duration-300 lg:hidden flex flex-col justify-center items-center ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(15,23,42,0.98)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              href={link.path}
              className="transition-colors"
              style={{
                color: "var(--white)",
                fontFamily: "var(--oswald)",
                fontSize: "32px",
                fontWeight: 400,
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
