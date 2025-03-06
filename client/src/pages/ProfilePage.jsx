import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    image: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch user details on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      // Pre-fill form with current user details
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        image: null,
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to current user details
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        image: null,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone_number', formData.phone_number);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await axiosInstance.post('/auth/edit-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh user data after update
      await fetchUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      {!isEditing ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">User Profile</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={
                  user && user.profile_image
                    ? `http://localhost:8080/${user.profile_image}`
                    : 'https://www.gravatar.com/avatar/placeholder?s=250'
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Name</h3>
                <p>{user.name}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p>{user.email}</p>
              </div>
              {user.phone_number && (
                <div>
                  <h3 className="text-xl font-semibold">Phone Number</h3>
                  <p>{user.phone_number}</p>
                </div>
              )}
              {user.department_id && (
                <div>
                  <h3 className="text-xl font-semibold">Department</h3>
                  <p>{user.department_id}</p>
                </div>
              )}
              {user.joined_at && (
                <div>
                  <h3 className="text-xl font-semibold">Joined At</h3>
                  <p>{new Date(user.joined_at).toLocaleDateString()}</p>
                </div>
              )}
              {user.added_courses && user.added_courses.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold">Added Courses</h3>
                  <p>{user.added_courses.length}</p>
                </div>
              )}
              <button
                onClick={handleEditToggle}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Edit Profile</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-4 py-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-4 py-2"
              />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-lg font-medium">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-4 py-2"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-lg font-medium">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                disabled={submitLoading}
              >
                {submitLoading ? 'Updating...' : 'Update Profile'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
