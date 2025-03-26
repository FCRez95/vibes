import React, { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  onStart: () => void;
  onEnd: () => void;
}

export function Joystick({ onMove, onStart, onEnd }: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const radius = 50;
  const knobSize = 40;

  const handleStart = (x: number, y: number) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isInBottomLeftTwoThirds = x <= screenWidth / 2 && y >= screenHeight / 3;

    if (isInBottomLeftTwoThirds) {
      setIsActive(true);
      onStart();
      
      // Set the base position to the touch position
      setBasePosition({ x: x - radius, y: y - radius });
      
      // Set initial knob position to center
      setPosition({ x: radius, y: radius });
      
      // Start with no movement
      onMove({ x: 0, y: 0 });
    }
  };

  const handleMove = (x: number, y: number) => {
    if (!isActive) return;
    
    // Calculate position relative to base
    const relativeX = x - basePosition.x;
    const relativeY = y - basePosition.y;
    
    updatePosition(relativeX, relativeY);
  };

  const handleEnd = () => {
    if (!isActive) return;
    
    setIsActive(false);
    setPosition({ x: radius, y: radius });
    onEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    handleEnd();
  };

  const updatePosition = (x: number, y: number) => {
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let newMagnitude: number;
    let newDirection: { x: number; y: number };

    if (distance > radius) {
      const angle = Math.atan2(dy, dx);
      newMagnitude = 1;
      newDirection = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      setPosition({
        x: radius + Math.cos(angle) * radius,
        y: radius + Math.sin(angle) * radius
      });
    } else {
      newMagnitude = distance / radius;
      newDirection = {
        x: dx / radius,
        y: dy / radius
      };
      setPosition({ x, y });
    }
    
    onMove({
      x: newDirection.x * newMagnitude,
      y: newDirection.y * newMagnitude
    });
  };

  return (
    <>
      {/* Joystick */}
      <div 
        className="fixed bottom-0 left-0 w-1/2 h-2/3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        {/* Base circle */}
        <div 
          ref={joystickRef}
          className="absolute rounded-full bg-white/20"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: isActive ? basePosition.x : 50,
            bottom: isActive ? window.innerHeight - basePosition.y - radius * 2 : 60,
            transition: isActive ? 'none' : 'all 0.1s ease-out'
          }}
        >
          {/* Knob */}
          <div 
            className="relative rounded-full bg-white/50"
            style={{
              width: knobSize,
              height: knobSize,
              left: isActive ? position.x - knobSize / 2 : 50 - knobSize / 2,
              top: isActive ? position.y - knobSize / 2 : 50 - knobSize / 2,
              transition: isActive ? 'none' : 'all 0.1s ease-out'
            }}
          />
        </div>
      </div>
    </>
  );
} 