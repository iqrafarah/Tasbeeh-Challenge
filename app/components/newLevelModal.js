import React from 'react';
import { useLevelUp } from '../lib/LevelUpContext';

export default function LevelUpModal() {
    const { isModalVisible, closeModal, level } = useLevelUp();

    if (!isModalVisible) return null; // Don't render the modal if it's not visible

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 className="title">New Level</h2>
                <button onClick={closeModal}>Close</button>
            </div>
        </div>
    );
}
