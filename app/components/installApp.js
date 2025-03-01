import React, { useState, useEffect } from "react";

const InstallAppModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("beforeinstallprompt event captured");
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log("Prompting install");
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    } else {
      console.log("No deferred prompt available");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Install App</h2>
        <p className="mb-4">Install this app on your device for a better experience.</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="buttonSecondary">Cancel</button>
          <button onClick={handleInstallClick} className="button">Install</button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;