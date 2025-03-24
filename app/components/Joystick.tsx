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
  const radius = 50;
  const knobSize = 40; // Size of the knob

  // Initialize position to center
  useEffect(() => {
    setPosition({ x: radius, y: radius });
  }, []);

  const handleStart = (x: number, y: number) => {
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Check if touch is in bottom left quarter of screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isInBottomLeftQuarter = x <= screenWidth / 2 && y >= screenHeight / 2;

    if (isInBottomLeftQuarter) {
      setIsActive(true);
      onStart();
      
      // Calculate the position relative to the joystick container
      const localX = Math.min(Math.max(x - rect.left, radius), screenWidth / 2 - radius);
      const localY = Math.min(Math.max(y - rect.top, radius), screenHeight / 2 - radius);
      
      updatePosition(localX, localY);
    }
  };

  const handleMove = (x: number, y: number) => {
    if (!isActive) return;
    
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localX = x - rect.left;
    const localY = y - rect.top;
    updatePosition(localX, localY);
  };

  const handleEnd = () => {
    if (!isActive) return;
    
    setIsActive(false);
    setPosition({ x: radius, y: radius });
    onEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
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
        ref={joystickRef}
        className="fixed bottom-0 left-0 w-1/2 h-1/2"
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
        <div className="absolute w-[100px] h-[100px] rounded-full bg-white/20" style={{
            left: position.x,
            bottom: position.y
        }}>
            {/* Knob */}
            <div 
                className="relative rounded-full bg-white/50"
                style={{
                    width: knobSize,
                    height: knobSize,
                    left: position.x - knobSize / 2,
                    top: position.y - knobSize / 2,
                    transition: isActive ? 'none' : 'all 0.1s ease-out'
                }}
            />
        </div>
      </div>
    </>
  );
} 