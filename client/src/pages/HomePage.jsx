// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const HomePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data.user); // Update based on the "user" object structure from the response
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  // Format the joined date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {user ? (
        <>
          <h1>Welcome, {user.name || 'User'}</h1>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Joined At:</strong> {formatDate(user.joined_at)}</p>
          <p><strong>Added Courses:</strong> {user.added_courses ? user.added_courses : 'No courses added'}</p>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default HomePage;
