import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';

const WebState = ({ children }: any) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export const App = () => (
  <WebState>
    <AppRouter />
  </WebState>
)
