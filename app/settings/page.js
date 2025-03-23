"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { userService } from "../lib/services/userService";
import app from "../lib/firebase.config";
import ConfirmationModal from "../components/confirmationModal";
import InstallAppModal from "../components/installApp";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        if (!isAccountDeleted) {
          router.push("/");
        }
        return;
      }

      setUser(authUser);
      try {
        const data = await userService.getUser(authUser.uid);
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    });

    return () => unsubscribe();
  }, [auth, router, isAccountDeleted]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setShowInstallModal(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Error signing out", error.message);
    }
    setShowLogoutConfirmation(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const isPWA = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirmation(false); // Close delete confirmation modal first

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    setIsDeleting(true);

    try {
      // Directly delete the account without re-authentication
      await userService.handleDeleteAccount(currentUser.uid);

      setShowSuccessModal(true); // Show success modal after deletion
      toast.success("Account deleted successfully");

      // Redirect to home page after account deletion
      router.push("/"); // This will redirect the user to the home page
    } catch (error) {
      console.error("Error during account deletion:", error);
      toast.error("Failed to delete account: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get subscription info in a user-friendly format
  const getSubscriptionInfo = () => {
    if (!userData || !userData.subscription)
      return { status: "Free", daysLeft: 0 };

    const { status, trialEndDate } = userData.subscription;

    if (status === "trial") {
      const endDate =
        trialEndDate instanceof Date ? trialEndDate : trialEndDate.toDate();
      const daysLeft = Math.max(
        0,
        Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
      );
      return { status: "Trial", daysLeft };
    } else if (status === "lifetime") {
      return { status: "Premium Lifetime" };
    } else {
      return { status: "Free" };
    }
  };

  const subscriptionInfo = userData?.subscription
    ? getSubscriptionInfo()
    : { status: "Free", daysLeft: 0 };

  if (!user || !userData) {
    return null; // If user or userData isn't available
  }

  return (
    <div className="overflow-y-auto pb-[130px]">
      <div className="flex gap-3 items-center mb-5">
        {/* Close Button */}
        <div className="">
          <Link href="/profile">
            <i className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
          </Link>
        </div>

        <h1 className="title w-[80%] text-center">Settings</h1>
      </div>

      {(subscriptionInfo.status === "Trial" ||
        subscriptionInfo.status === "Free") && (
        <div className="mt-5">
          {/* Upgrade to Pro Section */}
          <Link href="/pricing">
            <div className="border border-[#d8d8f2] flex items-center justify-between px-4 py-3 rounded-xl bg-[#d8d8f2]">
              <div className="flex gap-3">
                <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-[#949CD0] overflow-hidden">
                  <i className="fa-solid fa-crown text-2xl"></i>
                </div>
                <div className="flex gap-1 flex-col">
                  <h3 className="text-[15px] font-semibold capitalize">
                    Upgrade to pro
                  </h3>
                  <p className="text-xs text-gray-500">to use the app</p>
                </div>
              </div>
              <div>
                <i className="fa-solid fa-chevron-right text-sm cursor-pointer"></i>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Feedback Section */}
      <div className="mt-6">
        <h4 className="uppercase text-gray-600 text-sm font-medium">Socials</h4>
        <Link href="https://discord.gg/DChsuaXZ" target="_blank">
          <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                <i className="fa-brands fa-discord text-2xl "></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">
                  Join Discord Community
                </h3>
                <p className="text-xs text-gray-500">
                  Share your thoughts with us
                </p>
              </div>
            </div>
            <div>
              <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
            </div>
          </div>
        </Link>
        <Link
          href="https://www.instagram.com/tasbeehchallenge/"
          target="_blank"
        >
          <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                <i className="fa-brands fa-instagram text-2xl "></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">
                  Follow us on Instagram
                </h3>
                <p className="text-xs text-gray-500">See our latest posts</p>
              </div>
            </div>
            <div>
              <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
            </div>
          </div>
        </Link>
        <Link href="https://www.tiktok.com/@tasbeehchallenge" target="_blank">
          <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                <i className="fa-brands fa-tiktok text-2xl "></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">
                  Follow us on Tiktok
                </h3>
                <p className="text-xs text-gray-500">Get the latest updates</p>
              </div>
            </div>
            <div>
              <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
            </div>
          </div>
        </Link>
      </div>

      {/* Legal Section */}
      <div className="mt-6">
        <Link href="/TOS">
          <h4 className="uppercase text-gray-600 text-sm font-medium">Legal</h4>
          <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                <i className="fa-solid fa-file-contract text-xl "></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">
                  Terms of Use
                </h3>
                <p className="text-xs text-gray-500">Read our terms</p>
              </div>
            </div>
            <div>
              <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
            </div>
          </div>
        </Link>
        <Link href="/privacy-policy">
          <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                <i className="fa-solid fa-shield text-xl "></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">
                  Our Privacy Policy
                </h3>
                <p className="text-xs text-gray-500">View our privacy Policy</p>
              </div>
            </div>
            <div>
              <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
            </div>
          </div>
        </Link>
      </div>

      {/* Install App Section */}
      <div className="mt-6">
        <h4 className="uppercase text-gray-500 text-sm font-medium">App</h4>
        <div
          onClick={() => setShowInstallModal(true)}
          className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
        >
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-download text-xl"></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">
                Install This App
              </h3>
              <p className="text-xs text-gray-500">
                Install this app on your device
              </p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6">
        <h4 className="uppercase text-gray-500 text-sm font-medium">Info</h4>
        <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-circle-info text-xl"></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">
                App Version
              </h3>
              <p className="text-xs text-gray-500">1.0.1</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>
      </div>

      {/* logout & delete account */}
      <div className="mt-6">
        <h4 className="uppercase text-gray-500 text-sm font-medium">Account</h4>

        {/* Logout Section */}
        <div
          onClick={handleLogout}
          className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
        >
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-sign-out-alt text-xl"></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">Log out</h3>
              <p className="text-xs text-gray-500">Logout current account</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>

        {/* Delete Account Section */}
        <div
          onClick={handleDeleteAccount}
          className={`mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${
            isDeleting ? "cursor-not-allowed" : ""
          }`}
        >
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-user-minus text-xl"></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">
                {isDeleting ? "Processing..." : "Delete My Account"}
              </h3>
              <p className="text-xs text-gray-500">Delete current account</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={confirmLogout}
        title="Logout of this account"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        confirmColor="bg-red-500"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        confirmText={isDeleting ? "Processing..." : "Delete"}
        confirmColor="bg-red-500"
        disabled={isDeleting}
      />

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={handleInstallClick}
      />
    </div>
  );
}
