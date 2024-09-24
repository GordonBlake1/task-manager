import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token"); // Get the token from local storage

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        setError("Error fetching user profile");
        console.error("Error fetching profile:", err);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-500">{error}</p>}
      {user ? (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {/* Add more user info as needed */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
