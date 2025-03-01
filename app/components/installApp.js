import React, { useState, useEffect } from "react";

const InstallAppModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 mx-4">
        <h2 className="text-xl font-bold mb-4">Install App</h2>
        
        {isIOS ? (
          <>
            <p className="mb-4">To install this app on your iOS device:</p>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Tap the Share button <span className="inline-block w-5 h-5 bg-gray-200 rounded-sm text-center">↑</span> at the bottom of the screen</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </>
        ) : (
          <p className="mb-4">Install this app on your device for a better experience.</p>
        )}
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="buttonSecondary"
          >
            Cancel
          </button>
          
          {!isIOS && (
            <button 
              onClick={handleInstallClick} 
              disabled={!deferredPrompt}
              className="button"
            >
              Install
            </button>
          )}
          
          {isIOS && (
            <button 
              onClick={onClose}
              className="button"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;