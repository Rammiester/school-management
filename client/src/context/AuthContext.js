import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { appDefaults } from "../api/index.js";
import { jwtDecode } from "jwt-decode";
import { message } from "antd";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return null;
        }
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

const login = async (username, password, navigate) => {
    try {
      // Use the configured base URL:
      const response = await axios.post(`${appDefaults.api.baseURL}/api/users/login`, {
        email: username,
        password: password,
      });

      const { user: userData, token } = response?.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      navigate("/dashboard");
      return response.data; // Return the data for success
    } catch (error) {
      message.error("Invalid email or password");
      throw error; // Re-throw to handle in caller
    }
  };

  const logout = (navigate) => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/Login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
