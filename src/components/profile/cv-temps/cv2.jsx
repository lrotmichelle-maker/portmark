import React from 'react';
import { EditableText } from './shared';

export const CV2 = ({ profileData, setProfileData, ImageUploadTrigger, DynamicSectionsRender }) => {
  // FIXED: Removed activeSections destructuring
  const { data } = profileData;

  const updateField = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  if (!data) return null;

  return (
    <div style={{ 
      minHeight: '297mm', 
      padding: '60px 80px', 
      fontFamily: 'Georgia, serif', 
      color: '#2d2d2d', 
      background: '#ffffff',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <EditableText 
          value={data.name} 
          placeholder="YOUR NAME" 
          onUpdate={(v) => updateField('name', v)} 
          style={{ fontSize: '40px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }} 
          as="h1"
        />
        <EditableText 
          value={data.title} 
          placeholder="Professional Title" 
          onUpdate={(v) => updateField('title', v)} 
          style={{ fontSize: '18px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }} 
          as="p"
        />
        
        {/* Contact Block (Always active now, manageable inline) */}
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#888', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <EditableText value={data.email} placeholder="email@example.com" onUpdate={(v) => updateField('email', v)} />
          <span> | </span>
          <EditableText value={data.phone} placeholder="+00 000 000" onUpdate={(v) => updateField('phone', v)} />
          <span> | </span>
          <EditableText value={data.location} placeholder="Location" onUpdate={(v) => updateField('location', v)} />
        </div>
      </header>

      {/* Content Canvas Layout Area */}
      <main style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
        {/* 
          Renders all core blocks + any new custom categories the user adds.
          They can change text titles, descriptions, or trash any section on the fly.
        */}
        {DynamicSectionsRender}
      </main>
    </div>
  );
};