import React from 'react';
import './App.css';

function About() {
  return (
    <div className="home-container" style={{ maxWidth: '800px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h1 style={{ color: '#E2001A', marginBottom: '20px', fontSize: '2.2rem', textAlign: 'center' }}>Despre Noi</h1>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1A1A1A', marginBottom: '15px' }}>Misiunea Noastră</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1.1rem' }}>
            Misiunea Match & Dine este de a simplifica modul în care descoperi și rezervi locuri la cele mai bune restaurante. 
            Ne dorim să conectăm pasionații de gastronomie cu experiențe culinare memorabile, oferind o platformă intuitivă 
            și personalizată care aduce restaurantele de top direct la îndemâna ta.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1A1A1A', marginBottom: '15px' }}>Contact</h2>
          <ul style={{ listStyleType: 'none', padding: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.8' }}>
            <li><strong>Telefon Contact:</strong> +40 (000) 000-000</li>
            <li><strong>Telefon Vânzări:</strong> +40 (111) 111-111</li>
            <li><strong>Email:</strong> contact@matchanddine.ro</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#1A1A1A', marginBottom: '15px' }}>Locația Noastră</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>Bulevardul Iuliu Maniu 15G, București</p>
          <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
            <iframe 
              title="Harta Locatie Match and Dine"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src="https://maps.google.com/maps?q=Bulevardul%20Iuliu%20Maniu%2015G&t=&z=15&ie=UTF8&iwloc=&output=embed">
            </iframe>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;