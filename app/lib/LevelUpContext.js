// app/lib/LevelUpContext.js
"use client";  // Mark this as a client-side component

import React, { createContext, useState, useContext } from 'react';

const LevelUpContext = createContext();

export function useLevelUp() {
    return useContext(LevelUpContext);
}

export function LevelUpProvider({ children }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [level, setLevel] = useState(1); // Default to level 1

    const showLevelUpModal = (newLevel) => {
        console.log("Showing level up modal for level:", newLevel);
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
