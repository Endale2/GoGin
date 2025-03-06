import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
    

      

     

      try {
        // Fetch public user profile
        const profileResponse = await axiosInstance.get(`/auth/user/${userId}`);
        setProfile(profileResponse.data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, navigate]);

  if (loading)
    return (
      <div className="text-center mt-10 text-lg font-semibold">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        {profile.name}'s Profile
      </h1>
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={
              profile.profile_image
                ? `http://localhost:8080/${profile.profile_image}`
                : 'https://via.placeholder.com/150'
            }
            alt={profile.name}
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Email</h3>
            <p className="text-gray-700">{profile.email}</p>
          </div>
          {profile.phone_number && (
            <div>
              <h3 className="text-xl font-semibold">Phone Number</h3>
              <p className="text-gray-700">{profile.phone_number}</p>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold">Joined At</h3>
            <p className="text-gray-700">
              {new Date(profile.joined_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
