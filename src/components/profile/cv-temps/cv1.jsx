import React from 'react';
import { EditableText } from './shared';

export const CV1 = ({ profileData, setProfileData, ImageUploadTrigger, DynamicSectionsRender }) => {
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
      display: 'grid', 
      gridTemplateColumns: '35% 65%', 
      minHeight: '297mm', 
      background: '#fdfaf8', 
      color: '#4a3f35' 
    }}>
      {/* Left Profile Segment Column */}
      <div style={{ background: '#dccdc0', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          background: '#b8a699', 
          margin: '0 auto 20px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="Profile Picture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            ImageUploadTrigger
          )}
        </div>
        
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ borderBottom: '1px solid #4a3f35', fontSize: '14px', letterSpacing: '0.1em' }}>CONTACT</h3>
          <EditableText value={data.phone} placeholder="+256 700 000 000" onUpdate={(v) => updateField('phone', v)} />
          <EditableText value={data.email} placeholder="email@example.com" onUpdate={(v) => updateField('email', v)} />
          <EditableText value={data.location} placeholder="Location" onUpdate={(v) => updateField('location', v)} />
        </div>
      </div>

      {/* Right Core Content Segment Column */}
      <div style={{ padding: '40px 30px', textAlign: 'left' }}>
        <EditableText 
          value={data.name} 
          placeholder="YOUR NAME" 
          onUpdate={(v) => updateField('name', v)} 
          style={{ fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }} 
        />
        <EditableText 
          value={data.title} 
          placeholder="PROFESSIONAL TITLE" 
          onUpdate={(v) => updateField('title', v)} 
          style={{ fontSize: '18px', color: '#8c7a6b', textTransform: 'uppercase', marginBottom: '20px' }} 
        />
        
        {/* Renders every active layout block with inline controls seamlessly */}
        {DynamicSectionsRender}
      </div>
    </div>
  );
};