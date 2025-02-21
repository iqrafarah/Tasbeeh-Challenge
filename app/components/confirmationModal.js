import React from "react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-[#94D098]", 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold text-center mb-4">{title}</h2>
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="buttonSecondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${confirmColor} deletebutton`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}