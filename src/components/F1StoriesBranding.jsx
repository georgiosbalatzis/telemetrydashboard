import React from 'react';
import logo from '../assets/logo.png';

export const F1StoriesLogo = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };
  
  return (
    <img src={logo} alt="F1Stories Logo" className={`${sizeClasses[size]}`} />
  );
};

export const F1StoriesPoweredBy = ({ textColor = 'text-cyan-400', size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  return (
    <p className={`${textColor} ${sizeClasses[size]} font-medium`}>Powered by F1Stories</p>
  );
}; 