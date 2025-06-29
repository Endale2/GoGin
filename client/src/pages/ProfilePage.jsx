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
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.toLowerCase().endsWith('.edu.et')) {
      newErrors.email = 'Please use your institutional email address (.edu.et)';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('email', formData.email.toLowerCase());
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
      setErrors({});
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setErrors({ general: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getInstitutionFromEmail = (email) => {
    if (!email || !email.includes('@')) return '';
    const domain = email.split('@')[1];
    if (domain.endsWith('.edu.et')) {
      return domain.replace('.edu.et', '');
    }
    return '';
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      {!isEditing ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Student Profile</h2>
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
                <h3 className="text-xl font-semibold">Full Name</h3>
                <p className="text-gray-700">{user.name}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Institutional Email</h3>
                <p className="text-gray-700">{user.email}</p>
                <p className="text-sm text-blue-600 font-medium">
                  Institution: {getInstitutionFromEmail(user.email).toUpperCase()}
                </p>
              </div>
              {user.phone_number && (
                <div>
                  <h3 className="text-xl font-semibold">Phone Number</h3>
                  <p className="text-gray-700">{user.phone_number}</p>
                </div>
              )}
              {user.department_id && (
                <div>
                  <h3 className="text-xl font-semibold">Department</h3>
                  <p className="text-gray-700">{user.department_id}</p>
                </div>
              )}
              {user.year_of_study && (
                <div>
                  <h3 className="text-xl font-semibold">Year of Study</h3>
                  <p className="text-gray-700">Year {user.year_of_study}</p>
                </div>
              )}
              {user.joined_at && (
                <div>
                  <h3 className="text-xl font-semibold">Member Since</h3>
                  <p className="text-gray-700">{new Date(user.joined_at).toLocaleDateString()}</p>
                </div>
              )}
              {user.added_courses && user.added_courses.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold">Enrolled Courses</h3>
                  <p className="text-gray-700">{user.added_courses.length} courses</p>
                </div>
              )}
              <button
                onClick={handleEditToggle}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Edit Student Profile</h2>
          
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 w-full border rounded px-4 py-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium">
                Institutional Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 w-full border rounded px-4 py-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="yourname@university.edu.et"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Only institutional emails ending with .edu.et are accepted
              </p>
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
                className="mt-1 w-full border rounded px-4 py-2 border-gray-300"
                placeholder="Enter your phone number"
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
                onChange={handleChange}
                accept="image/*"
                className="mt-1 w-full border rounded px-4 py-2 border-gray-300"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
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
