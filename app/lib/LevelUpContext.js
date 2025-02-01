// LevelUpContext.js
import React, { createContext, useState, useContext } from 'react';

const LevelUpContext = createContext();

export function useLevelUp() {
    return useContext(LevelUpContext);
}

export function LevelUpProvider({ children }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [level, setLevel] = useState(1);

    const showLevelUpModal = (newLevel) => {
        setLevel(newLevel);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <LevelUpContext.Provider value={{ isModalVisible, showLevelUpModal, closeModal, level }}>
            {children}
        </LevelUpContext.Provider>
    );
}
