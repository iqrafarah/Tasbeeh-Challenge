import React, { useEffect, useRef } from "react";
import Image from "next/image";

const NotificationModal = ({ isOpen, onClose, message, type }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Add a slight delay to ensure the DOM is updated before applying the animation
            setTimeout(() => {
                modalRef.current.classList.add("slide-in");
            }, 10);

            // Automatically close the notification after 3 seconds
            const timeoutId = setTimeout(() => {
                onClose();
            }, 3000); // 3 seconds delay

            // Cleanup the timeout if the component unmounts or `isOpen` changes
            return () => clearTimeout(timeoutId);
        } else {
            modalRef.current?.classList.remove("slide-in");
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-start justify-center pointer-events-none z-[1000]">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-lg w-[325px] mx-4 mt-4 p-4 transform transition-transform duration-300 ease-out -translate-y-full"
            >
                <div className="flex items-center gap-2">
                        <Image
                            src="/icon.png"
                            alt="icon"
                            width={100}
                            height={100}
                            className="w-[60px] h-[50px] object-cover rounded-lg"
                        />             
                    <div className="flex flex-col flex-wrap">
                        <h2 className="text-md font-semibold">
                            {type === "warning" ? "Oops!" : "Yay!"}
                        </h2>
                        <p className="text-xs">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;