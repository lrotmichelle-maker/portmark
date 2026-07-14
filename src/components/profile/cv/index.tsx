'use client';

import React, { useState } from 'react';
import { CV1 } from '../cv-temps/cv1';
import { CV2 } from '../cv-temps/cv2';
import { CV3 } from '../cv-temps/cv3';

export function CVBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [profileData, setProfileData] = useState({
    data: {
      fullName: 'Your Name',
      email: 'email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'City, Country',
      summary: 'Your professional summary',
      experience: [],
      education: [],
      skills: [],
    },
  });

  const templates = [CV1, CV2, CV3];
  const CurrentTemplate = templates[selectedTemplate];

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setSelectedTemplate(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTemplate === index
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
            }`}
          >
            Template {index + 1}
          </button>
        ))}
      </div>
      <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <CurrentTemplate 
          profileData={profileData}
          setProfileData={setProfileData}
        />
      </div>
    </div>
  );
}
