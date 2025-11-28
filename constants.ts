import { ChatMode } from './types';

export const APP_NAME = "Vissoo";

export const REPORT_CATEGORIES = [
  { id: 'nudity', label: 'Nudity / Sexual Content' },
  { id: 'abuse', label: 'Harassment / Abuse' },
  { id: 'spam', label: 'Spam / Scams' },
  { id: 'underage', label: 'Underage User' },
  { id: 'other', label: 'Other' },
];

export const MOCK_STRANGER_RESPONSES = [
  "Hey there! How's it going?",
  "From where are you connecting?",
  "I love this app, way better than the old ones.",
  "Do you like music?",
  "Just chilling here.",
  "Haha, that's funny.",
  "Skipping...",
];

export const PLACEHOLDER_AVATAR = "https://picsum.photos/200/200?grayscale";
export const PLACEHOLDER_VIDEO_POSTER = "https://picsum.photos/640/480?blur=5";

// Simulation Constants
export const MATCH_DELAY_MS = 2500;
export const AUTO_REPLY_DELAY_MS = 4000;