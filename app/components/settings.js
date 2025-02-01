import React from 'react';

export default function Settings() {
    const [showSettings, setShowSettings] = React.useState(false);

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    }

    return (
        <div>
            <i
                className="fa-solid fa-gear text-2xl text-right w-full pr-2"
                onClick={toggleSettings}
            ></i>

            {showSettings && (
                <div className="border-2 settingsContainer fixed top-0 z-50">
                    <i className="fa-solid fa-chevron-left text-lg mb-3"></i>
                    <h1 className="title">Settings</h1>


                    <div className="">
                        <div className="border flex">
                            <div className="">
                                <i className="fa-solid fa-crown"></i>
                            </div>

                            <div className="flex flex-col">
                                <h3>Upgrade to pro</h3>
                                <p>To use the app</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
