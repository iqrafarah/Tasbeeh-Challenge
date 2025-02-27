import React from "react";

const InstallAppModal = ({ isOpen, onClose, onInstall }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg  w-80">
        <h2 className="text-xl font-bold mb-4">Install App</h2>
        <p className="mb-4">Install this app on your device for a better experience.</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="buttonSecondary">Cancel</button>
          <button onClick={onInstall} className="button">Install</button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppModal;