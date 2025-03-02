import React from 'react';

const DayDetailModal = ({ isOpen, onClose, date, count }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Dhikr Details</h2>
                <p className="text-center text-lg">Date: {date}</p>
                <p className="text-center text-lg">Total Dhikr: {count}</p>
                <button
                    onClick={onClose}
                    className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-full w-full hover:bg-blue-600 transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default DayDetailModal;