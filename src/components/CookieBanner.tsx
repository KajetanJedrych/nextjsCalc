"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    updateConsent?: (adStorage: string, analyticsStorage: string) => void;
  }
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if we already have consent
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setShowBanner(false);

    // Update consent in Google Consent Mode
    if (typeof window !== "undefined" && window.updateConsent) {
      window.updateConsent("granted", "granted");
    }
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setShowBanner(false);

    // Keep consent denied in Google Consent Mode
    if (typeof window !== "undefined" && window.updateConsent) {
      window.updateConsent("denied", "denied");
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-4">
          <p className="text-sm text-gray-700">
            Ta strona używa plików cookie, aby zapewnić najlepsze wrażenia.
            Zgadzając się, akceptujesz używanie plików cookie zgodnie z naszą
            polityką cookie.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Tylko niezbędne
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Akceptuj wszystkie
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
