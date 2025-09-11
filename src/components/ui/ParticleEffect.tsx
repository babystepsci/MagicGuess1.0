import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ParticleEffectProps {
  active: boolean;
  color?: string;
  particleCount?: number;
  className?: string;
}

export function ParticleEffect({ 
  active, 
  color = '#10B981', 
  particleCount = 20, 
  className = '' 
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0,
        maxLife: Math.random() * 60 + 30,
        color,
      });
    }
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life + 1,
      })).filter(particle => particle.life < particle.maxLife));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [active, color, particleCount]);

  if (!active || particles.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            opacity: Math.max(0, 1 - particle.life / particle.maxLife),
            transform: `scale(${Math.max(0.1, 1 - particle.life / particle.maxLife)})`,
            boxShadow: `0 0 15px ${particle.color}, 0 0 30px ${particle.color}40`,
            filter: `blur(${Math.random() * 0.5}px)`,
          }}
        />
      ))}
    </div>
  );
}