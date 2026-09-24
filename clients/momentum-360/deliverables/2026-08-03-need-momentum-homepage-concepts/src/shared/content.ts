import { Aperture, Camera, Clapperboard, Code2, MapPinned, Newspaper, Podcast, Search, Share2, Sparkles, type LucideIcon } from 'lucide-react';

export const auditUrl = 'https://www.needmomentum.com/free-website-seo-audit/';

export type Service = {
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  image: string;
  hue: 'blue' | 'yellow';
};

export const services: Service[] = [
  {
    title: 'SEO services',
    short: 'Get found',
    description: 'Search strategy, technical SEO and content built around the way customers discover businesses now.',
    icon: Search,
    image: '/assets/proof/commercial-skyline.jpg',
    hue: 'blue'
  },
  {
    title: 'Social media marketing',
    short: 'Stay in motion',
    description: 'Channel strategy, campaigns and daily creative that make the brand feel active, useful and human.',
    icon: Share2,
    image: '/assets/proof/hospitality.jpg',
    hue: 'yellow'
  },
  {
    title: 'Website development & hosting',
    short: 'Turn attention into action',
    description: 'Fast, useful web experiences designed to build trust and make the next step obvious.',
    icon: Code2,
    image: '/assets/proof/meeting-space.jpg',
    hue: 'blue'
  },
  {
    title: 'Podcast development & management',
    short: 'Build an owned voice',
    description: 'Production support that turns conversations into a consistent, reusable content engine.',
    icon: Podcast,
    image: '/assets/proof/automotive.jpg',
    hue: 'yellow'
  },
  {
    title: 'Momentum 360',
    short: 'Virtual tours',
    description: 'Immersive 360 experiences that make a location tangible before a customer ever arrives.',
    icon: Aperture,
    image: '/assets/proof/residential-townhome.jpg',
    hue: 'blue'
  },
  {
    title: 'Commercials & brand anthems',
    short: 'Make the story felt',
    description: 'Cinematic video built to express the company, the people and the reason the work matters.',
    icon: Clapperboard,
    image: '/assets/proof/commercial-skyline.jpg',
    hue: 'yellow'
  },
  {
    title: 'Google Business Profile management',
    short: 'Own the local moment',
    description: 'Profile strategy, content and local visibility work built to earn the next nearby customer.',
    icon: MapPinned,
    image: '/assets/proof/hospitality.jpg',
    hue: 'blue'
  },
  {
    title: 'Content creation',
    short: 'Still. Video. Always useful.',
    description: 'Photography and video made to work across landing pages, social, campaigns and sales.',
    icon: Camera,
    image: '/assets/proof/automotive.jpg',
    hue: 'yellow'
  },
  {
    title: 'Press & PR',
    short: 'Earn attention',
    description: 'Stories, announcements and authority moments shaped for the audiences that matter.',
    icon: Newspaper,
    image: '/assets/proof/meeting-space.jpg',
    hue: 'yellow'
  }
];

export const proofImages = [
  { src: '/assets/proof/residential-townhome.jpg', label: 'Residential spaces', alt: 'Bright residential townhome photographed for a virtual tour' },
  { src: '/assets/proof/commercial-skyline.jpg', label: 'Commercial places', alt: 'Commercial skyline seen from a modern interior' },
  { src: '/assets/proof/hospitality.jpg', label: 'Hospitality', alt: 'Hospitality venue photographed for immersive marketing' },
  { src: '/assets/proof/automotive.jpg', label: 'Automotive', alt: 'Automotive showroom prepared for a 360 experience' },
  { src: '/assets/proof/meeting-space.jpg', label: 'Meeting spaces', alt: 'Business meeting space photographed for digital marketing' }
];

export const values = [
  { icon: Sparkles, title: 'One clear point of view', text: 'Strategy, media and technology reinforce the same story instead of competing for attention.' },
  { icon: Camera, title: 'Proof people can feel', text: 'Real spaces, real founders and real work replace placeholder promises.' },
  { icon: MapPinned, title: 'Built around the next move', text: 'Every page and campaign has an intentional path from discovery to action.' }
];
