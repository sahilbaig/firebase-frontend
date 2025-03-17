"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { auth, rtdb } from "../../lib/firebase-client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [messages, setMessages] = useState<{ id: string; message: string }[]>(
    []
  );

  // Check if the user is authenticated
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to the home page (login) if the user is not authenticated
        router.push("/");
      } else {
        // Set the user's email
        setUserEmail(user.email || "");

        // Fetch RTDB data
        const messagesRef = ref(rtdb, "messages"); // Reference to the "messages" node in RTDB
        onValue(messagesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Convert the data into an array of messages
            const messagesArray = Object.entries(data).map(([id, message]) => ({
              id,
              message: (message as { message: string }).message,
            }));
            setMessages(messagesArray);
          } else {
            setMessages([]); // Clear messages if no data exists
          }
        });
      }
    });

    // Cleanup the subscription
    return () => unsubscribeAuth();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      router.push("/"); // Redirect to the home page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">Welcome, {userEmail}!</p>

        {/* Display RTDB Messages */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          {messages.length > 0 ? (
            <ul className="space-y-2">
              {messages.map((msg) => (
                <li key={msg.id} className="bg-gray-50 p-2 rounded">
                  {msg.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages found.</p>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
