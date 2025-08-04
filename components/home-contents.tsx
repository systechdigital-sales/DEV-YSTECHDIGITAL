'use client';

import Image from 'next/image';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path as needed
import React from 'react';

type OttGridSectionProps = {
  handleGetStarted: () => void;
};

const ottPlatforms = [
  { name: 'Sony LIV', image: '/Sony LIV.png' },
  { name: 'Zee5', image: '/Zee.png' },
  { name: 'Fancode', image: '/Fancode.png' },
  { name: 'LIONSGATE PLAY', image: '/Lionsgate Play.png' },
  { name: 'STAGE', image: '/Stage.png' },
  { name: 'DistroTV', image: '/Distro TV.png' },
  { name: 'ShemarooMe', image: '/Shemaroo Me.png' },
  { name: 'Hubhopper', image: '/hubhopper.png' },
  { name: 'aha Tamil', image: '/Aha Tamil.png' },
  { name: 'Red hot', image: '/Shemaroo Redhot_2X3_logo.png' },
  { name: 'Runn Tv', image: '/RUnn.png' },
  { name: 'OM TV', image: '/OM Tv.png' },
  { name: 'Dangal Play', image: '/Dangal play logo.png' },
  { name: 'Premiumflix', image: '/Premiumflix Logo_Color.png' },
  { name: 'CHAUPAL', image: '/chaupal hd logo.png' },
  { name: 'ShortsTV', image: '/Shorts TV.png' },
  { name: 'Sun NXT', image: '/Sun NXT.png' },
  { name: 'Playflix', image: '/playflix_logo.png' },
  { name: 'Shemaroo Gujarati', image: '/Shemaroo_Gujarati_16X9_logo.png' },
  { name: 'Dollywood Play', image: '/Dollywood Play.png' },
  { name: 'Nammaflix', image: '/Nammaflix.png' },
  { name: 'Chaupal Bhojpuri', image: '/placeholder-logo.png' },
  { name: 'ShemarooBhakti', image: '/Shemaroo Bhakti_2X3_logo.png' },
  { name: 'ETV Win', image: '/ETV WIN.png' },
  { name: 'aha', image: '/aha telugu.png' },
  { name: 'VROTT', image: '/VR.png' },
  { name: 'Shortfundly', image: '/Shortfundly.png' },
  { name: 'Atrangi', image: '/Atrangi.png' },
  { name: 'Bhaktiflix', image: '/BHAKTI FLIX.png' },
  { name: 'Fridaay', image: '/placeholder-logo.png' },
  { name: 'Gurjari', image: '/Gurjari.png' },
];

export default function OttGridSection({ handleGetStarted }: OttGridSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">What You Get?</h3>
          <p className="text-gray-600">Access to a wide range of premium OTT platforms</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-8 justify-center items-center">
  {ottPlatforms.map((platform, index) => (
    <div key={index} className="flex flex-col items-center text-center">
      <Image
        src={platform.image}
        alt={platform.name}
        width={60}
        height={60}
        className="mb-2 rounded-md shadow-md object-contain"
      />
      <span className="text-gray-700 text-sm font-medium">{platform.name}</span>
    </div>
  ))}
</div>


        
      </div>
    </section>
  );
}
