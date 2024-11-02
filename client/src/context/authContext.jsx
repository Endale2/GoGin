import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/auth/me').then((res) => {
      setUser(res.data);
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const login = async (credentials) => {
    await axios.post('/auth/login', credentials, { withCredentials: true });
    const { data } = await axios.get('/auth/me');
    setUser(data);
  };

  const logout = () => {
    setUser(null);
    axios.post('/auth/logout', {}, { withCredentials: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
