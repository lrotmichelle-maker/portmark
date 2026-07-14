import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { EditableText } from './shared';

export const CV3 = ({ profileData, setProfileData, ImageUploadTrigger, DynamicSectionsRender }) => {
  // FIXED: Removed activeSections to prevent crashes
  const { data } = profileData;

  const updateField = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 antialiased font-sans text-gray-900">
      <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-xl overflow-hidden min-h-[1100px] p-8 md:p-14 flex flex-col justify-between border border-gray-200">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 items-center mb-10 relative">
            <div className="absolute left-[-32px] md:left-[-56px] top-0 bottom-0 w-3 bg-[#333333] hidden sm:block" />
            <div className="space-y-4 text-left">
              <div>
                <EditableText value={data.name} placeholder="YOUR NAME" onUpdate={(v) => updateField('name', v)} style={{ fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: 'normal', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '2px' }} as="h1" />
                <EditableText value={data.title} placeholder="PROFESSIONAL TITLE" onUpdate={(v) => updateField('title', v)} style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', margin: 0 }} as="p" />
              </div>
              
              {/* Contact List (Always active now) */}
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li className="flex items-center gap-2"><Phone size={12} className="text-black" /><EditableText value={data.phone} placeholder="Phone" onUpdate={(v) => updateField('phone', v)} style={{ margin: 0 }} as="span" /></li>
                <li className="flex items-center gap-2"><Mail size={12} className="text-black" /><EditableText value={data.email} placeholder="Email" onUpdate={(v) => updateField('email', v)} style={{ margin: 0 }} as="span" /></li>
                <li className="flex items-center gap-2"><MapPin size={12} className="text-black" /><EditableText value={data.location} placeholder="Location" onUpdate={(v) => updateField('location', v)} style={{ margin: 0 }} as="span" /></li>
              </ul>
            </div>

            {/* Photo Rendering / Upload fallback handling */}
            <div className="flex justify-center md:justify-end">
              {data.photoUrl ? (
                <div className="w-32 h-40 overflow-hidden border border-gray-200 bg-gray-100 shadow-sm sm:w-36 sm:h-44">
                  <img src={data.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                </div>
              ) : ImageUploadTrigger ? (
                <div className="w-32 h-40 overflow-hidden border border-dashed border-gray-300 bg-gray-50 shadow-sm sm:w-36 sm:h-44 flex items-center justify-center">
                  {ImageUploadTrigger}
                </div>
              ) : null}
            </div>
          </div>

          {/* 
            Main Structural Content Canvas:
            Renders core blocks + custom categories seamlessly out of the list handler.
          */}
          <div className="w-full text-left modern-cv3-canvas">
            {DynamicSectionsRender}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-8 text-center md:text-right">
          <span className="text-[10px] text-gray-400 tracking-wider font-mono">CONFIDENTIAL PROFILE © 2026</span>
        </div>
      </div>
    </div>
  );
};

export default CV3;