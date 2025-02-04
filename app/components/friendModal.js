import React, { useState } from "react";

export default function FriendModal({ friendLink, setFriendLink, onClose, onAddFriend, onGenerateLink }) {
    const [showLink, setShowLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");
    const [copyButtonText, setCopyButtonText] = useState("Generate Link");

    const handleGenerateLink = () => {
        const link = onGenerateLink();
        setGeneratedLink(link);
        setShowLink(true);
        navigator.clipboard.writeText(link)
            .then(() => {
                setCopyButtonText("Copied!");
                setTimeout(() => setCopyButtonText("Generate Link"), 2000); // Reset button text after 2 seconds
            })
            .catch((error) => {
                console.error("Error copying link to clipboard:", error);
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-xl font-semibold mb-4">Add a Friend</h2>
                <div className="flex flex-col space-y-4">
                    <button onClick={handleGenerateLink} className="px-4 py-2 bg-green-500 text-white rounded">{copyButtonText}</button>
                    {showLink && (
                        <div className="mt-2 p-2 border border-gray-300 rounded">
                            <p className="text-sm">Share this link with your friend:</p>
                            <p className="text-sm text-blue-500 break-all">{generatedLink}</p>
                        </div>
                    )}
                    <input
                        type="text"
                        value={friendLink}
                        onChange={(e) => setFriendLink(e.target.value)}
                        placeholder="Enter friend link"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <div className="flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                        <button onClick={onAddFriend} className="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
}