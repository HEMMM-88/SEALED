import React from 'react';

export default function Particles({ items }) {
  return (
    <>
      {items.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left:   `${p.left}%`,
            bottom: `${p.bottom}%`,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: `hsl(${p.hue}, 70%, ${p.light}%)`,
            pointerEvents: 'none',
            zIndex: 5,
            animation: `particleFloat ${p.duration}s linear ${p.delay}s both`,
          }}
        />
      ))}
    </>
  );
}
