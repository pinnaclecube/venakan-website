import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("venakan_cookies_accepted");
    if (!accepted) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("venakan_cookies_accepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 translate-y-0 transition-transform duration-500">
      <div className="container mx-auto max-w-4xl">
        <div className="glass p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300 font-body">
            We use cookies to improve your experience and analyze site traffic. 
            By continuing to use this site, you consent to our use of cookies.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={accept} className="btn-primary py-2 px-6 text-sm">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
