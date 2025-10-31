import React, { createContext, useContext, useState, useEffect } from "react";
import { use } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async () => {
    if (!token) {
      setUserInfo(null);
      return;
    }
    try {
      const response = await authFetch('http://localhost:5000/user/info');
      if (response.ok) {
        const data = await response.json();
        if (token) {
          setUserInfo(data.user);
        }
      } else {
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(fetchUserInfo, 100);
        return { success: true };
      } else {
        return { success: false, message: data.detail || "Login failed" };
      }
    } catch (error) {
      return { success: false, message: "Login failed" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is invalid, logout user
    if (response.status === 401) {
      logout();
      return response;
    }

    if (response.status === 403) {
      try {
        const errorData = await response.clone().json();

        // Only logout for authentication-related 403 errors
        if (errorData.detail === 'Invalid token' ||
          errorData.detail === 'Access token required' ||
          errorData.detail === 'Admin access required') {
          logout();
        }

        // Don't logout for transaction limit (limitReached: true)
        if (errorData.limitReached) {
          return response;
        }
      } catch (e) {
        // If we can't parse the response, it might be a token issue
        console.error('Error parsing 403 response:', e);
      }
    }

    return response;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Only fetch user info after token is set
      setTimeout(() => {
        if (savedToken) { // Double check token still exists
          fetchUserInfo();
        }
      }, 100);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setUserInfo(null);
    }
  }, [token]);

  const value = {
    user,
    userInfo,
    token,
    login,
    logout,
    authFetch,
    fetchUserInfo,
    isLoggedIn: !!token,
    isAdmin: user?.isAdmin || false,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};