import React from 'react';
import { Component as SignInFlo } from './ui/sign-in-flo';

interface LoginPageProps {
  onBackToHome: () => void;
  onSuccessRedirect: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onSuccessRedirect }) => {
  return (
    <SignInFlo 
      onBackToHome={onBackToHome} 
      onSuccessRedirect={onSuccessRedirect} 
    />
  );
};

export default LoginPage;
