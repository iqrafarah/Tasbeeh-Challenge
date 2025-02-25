"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { userService } from "../lib/services/userService";
import app from "../lib/firebase.config";
import ConfirmationModal from "../components/confirmationModal";
import LoadingScreen from "../components/loadingScreen";

export default function SettingsPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/"); // Redirect to home if not authenticated
        return;
      }

      setUser(authUser);
      try {
        const data = await userService.getUser(authUser.uid);
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out", error.message);
    }
    setShowLogoutConfirmation(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await userService.handleDeleteAccount(user.uid);
        await user.delete(); // Ensure Firebase account is fully deleted

        setShowSuccessModal(true);

        // Sign out explicitly to remove any cached session
        await signOut(auth);

      } catch (error) {
        console.error("Error deleting account", error.message);
      }
      setShowDeleteConfirmation(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace("/"); // After closing the success modal, redirect to home
  };

  // Function to get subscription info in a user-friendly format
  const getSubscriptionInfo = () => {
    if (!userData || !userData.subscription) return { status: "Free", daysLeft: 0 };
    
    const { status, trialEndDate } = userData.subscription;
    
    if (status === "trial") {
      const endDate = trialEndDate instanceof Date ? trialEndDate : trialEndDate.toDate();
      const daysLeft = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
      return { status: "Trial", daysLeft };
    } else if (status === "monthly") {
      return { status: "Premium Monthly" };
    } else if (status === "lifetime") {
      return { status: "Premium Lifetime" };
    } else {
      return { status: "Free" };
    }
  };

  const subscriptionInfo = userData?.subscription ? getSubscriptionInfo() : { status: "Free", daysLeft: 0 };

  if (loading) {
    return <LoadingScreen />;
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

      {(subscriptionInfo.status === "Trial" || subscriptionInfo.status === "Free") && (
        <div className="mt-5">
          {/* Upgrade to Pro Section */}
          <Link href="/pricing">
          <div className="border border-[#d8d8f2] flex items-center justify-between px-4 py-3 rounded-xl bg-[#d8d8f2]">
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-[#949CD0] overflow-hidden">
                <i className="fa-solid fa-crown text-2xl"></i>
              </div>
              <div className="flex gap-1 flex-col">
                <h3 className="text-[15px] font-semibold capitalize">Upgrade to pro</h3>
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
        <h4 className="uppercase text-gray-600 text-sm font-medium">Feedback</h4>
        <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-brands fa-instagram text-2xl "></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">Join Instagram Group</h3>
              <p className="text-xs text-gray-500">Connect with the team!</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>
        
      </div>

      {/* Legal Section */}
      <div className="mt-6">
        <h4 className="uppercase text-gray-600 text-sm font-medium">Legal</h4>
        <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-file-contract text-xl "></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">Terms of service</h3>
              <p className="text-xs text-gray-500">Read our terms</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>
        <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-shield text-xl "></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">Privacy Policy</h3>
              <p className="text-xs text-gray-500">View our privacy Policy</p>
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
              <h3 className="text-[15px] font-semibold capitalize">Version</h3>
              <p className="text-xs text-gray-500">1.0.0</p>
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
        <div onClick={handleLogout} className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
          <div className="flex gap-3">
            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
              <i className="fa-solid fa-sign-out-alt text-xl"></i>
            </div>
            <div className="flex gap-1 flex-col">
              <h3 className="text-[15px] font-semibold capitalize">Logout</h3>
              <p className="text-xs text-gray-500">Logout current account</p>
            </div>
          </div>
          <div>
            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
          </div>
        </div>

        <button
          className="text-sm mt-3 text-red-500 font-semibold"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
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
        message="Are you sure you want to delete this account?"
        confirmText="Delete"
        confirmColor="bg-red-500"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        onConfirm={closeSuccessModal}
        title="Account Deleted"
        message="Your account has been deleted successfully."
        confirmText="OK"
        confirmColor="bg-green-500"
      />
    </div>
  );
}