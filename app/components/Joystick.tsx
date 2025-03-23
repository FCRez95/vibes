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
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [magnitude, setMagnitude] = useState(0);
  const radius = 50;
  const knobSize = 40; // Size of the knob

  // Initialize position to center
  useEffect(() => {
    setPosition({ x: radius, y: radius });
  }, []);

  const handleStart = (x: number, y: number) => {
    const rect = joystickRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localX = x - rect.left;
    const localY = y - rect.top;
    const distance = Math.sqrt(
      Math.pow(localX - radius, 2) + 
      Math.pow(localY - radius, 2)
    );

    if (distance <= radius) {
      setIsActive(true);
      onStart();
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
    setDirection({ x: 0, y: 0 });
    setMagnitude(0);
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

    setMagnitude(newMagnitude);
    setDirection(newDirection);
    
    onMove({
      x: newDirection.x * newMagnitude,
      y: newDirection.y * newMagnitude
    });
  };

  return (
    <div 
      ref={joystickRef}
      className="absolute bottom-5 left-5"
      style={{ width: radius * 2, height: radius * 2 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base circle */}
      <div 
        className="absolute w-full h-full rounded-full bg-white/20"
      />
      
      {/* Knob */}
      <div 
        className="absolute rounded-full bg-white/50"
        style={{
          width: knobSize,
          height: knobSize,
          left: position.x - knobSize / 2,
          top: position.y - knobSize / 2,
          transition: isActive ? 'none' : 'all 0.1s ease-out'
        }}
      />
      
      {/* Direction line */}
      {isActive && (
        <div 
          className="absolute h-0.5 bg-red-500/50 origin-left"
          style={{
            width: magnitude * radius,
            left: radius,
            top: radius,
            transform: `rotate(${Math.atan2(direction.y, direction.x)}rad)`
          }}
        />
      )}
    </div>
  );
} 