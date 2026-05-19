import React from 'react';

const AvatarOverlay = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',          // Centers the robot in its container
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/robot-active.png" 
        alt="AI Robot Avatar"
        style={{
          width: '160px', 
          height: '160px',       // Forces a perfect square
          objectFit: 'contain',  // Prevents stretching
          filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.6))',
          animation: 'float 3s ease-in-out infinite'
        }}
      />
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default AvatarOverlay;
