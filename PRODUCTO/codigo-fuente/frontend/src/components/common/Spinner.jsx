import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50/50 backdrop-blur-sm">
      <div className="relative flex justify-center items-center">
        {/* Outer ring */}
        <div className="absolute w-16 h-16 border-4 border-t-blue-600 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute w-10 h-10 border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        
        {/* Center dot */}
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-500 tracking-widest animate-pulse uppercase">Cargando</p>
    </div>
  );
};

export default Spinner;
