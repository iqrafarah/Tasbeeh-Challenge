// app/ClientLayout.js
"use client";  // Mark this as a client component

import { LevelUpProvider } from './lib/LevelUpContext';
import LevelUpModal from './components/newLevelModal';  // Import the modal component

export default function ClientLayout({ children }) {
    return (
        <LevelUpProvider>
            <LevelUpModal />  {/* Render the modal here */}
            {children}
        </LevelUpProvider>
    );
}
