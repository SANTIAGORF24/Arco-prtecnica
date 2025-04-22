import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      const { token, timestamp } = JSON.parse(storedToken);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return token;
      }
      localStorage.removeItem("authToken");
    }
    return null;
  });

  const login = (newToken: string) => {
    const tokenData = {
      token: newToken,
      timestamp: Date.now()
    };
    localStorage.setItem("authToken", JSON.stringify(tokenData));
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 