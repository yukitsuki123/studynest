import { ThemeName, ThemeColors } from './types';

/**
 * Premium Theme Palettes for StudyNest
 * Each theme defines a Light and Dark variant with high-quality color harmony.
 */
export const THEMES: Record<ThemeName, { light: ThemeColors; dark: ThemeColors }> = {
  oxford: {
    light: { bg:'#F8F5F0', bg2:'#F0EBE0', bg3:'#E2DBCC', card:'#FFFFFF', card2:'#FAF7F2', text:'#1C1917', text2:'#57534E', text3:'#A8A29E', accent:'#8B4513', accent2:'#B45309', accent3:'#166534', border:'#E7E5E4', border2:'#D6D4D1', red:'#B91C1C', blue:'#1D4ED8' },
    dark:  { bg:'#12100E', bg2:'#1C1917', bg3:'#26231F', card:'#171513', card2:'#1C1917', text:'#F5F5F4', text2:'#D6D3D1', text3:'#78716C', accent:'#D4703A', accent2:'#F59E0B', accent3:'#4ADE80', border:'#292524', border2:'#44403C', red:'#EF4444', blue:'#3B82F6' },
  },
  night: {
    light: { bg:'#F1F5F9', bg2:'#E2E8F0', bg3:'#CBD5E1', card:'#FFFFFF', card2:'#F8FAFC', text:'#0F172A', text2:'#475569', text3:'#94A3B8', accent:'#2563EB', accent2:'#3B82F6', accent3:'#0891B2', border:'#E2E8F0', border2:'#CBD5E1', red:'#E11D48', blue:'#1D4ED8' },
    dark:  { bg:'#020617', bg2:'#0F172A', bg3:'#1E293B', card:'#0B1224', card2:'#0F172A', text:'#F8FAFC', text2:'#94A3B8', text3:'#475569', accent:'#38BDF8', accent2:'#7DD3FC', accent3:'#22D3EE', border:'#1E293B', border2:'#334155', red:'#FB7185', blue:'#60A5FA' },
  },
  garden: {
    light: { bg:'#F0FDF4', bg2:'#DCFCE7', bg3:'#BBF7D0', card:'#FFFFFF', card2:'#F7FAF9', text:'#064E3B', text2:'#065F46', text3:'#34D399', accent:'#10B981', accent2:'#34D399', accent3:'#84CC16', border:'#DCFCE7', border2:'#BBF7D0', red:'#DC2626', blue:'#2563EB' },
    dark:  { bg:'#022C22', bg2:'#064E3B', bg3:'#065F46', card:'#04322A', card2:'#064E3B', text:'#ECFDF5', text2:'#A7F3D0', text3:'#34D399', accent:'#34D399', accent2:'#6EE7B7', accent3:'#A3E635', border:'#065F46', border2:'#0D9488', red:'#F87171', blue:'#60A5FA' },
  },
  space: {
    light: { bg:'#F0F9FF', bg2:'#E0F2FE', bg3:'#BAE6FD', card:'#FFFFFF', card2:'#F8FDFF', text:'#082F49', text2:'#075985', text3:'#38BDF8', accent:'#0EA5E9', accent2:'#38BDF8', accent3:'#2DD4BF', border:'#E0F2FE', border2:'#BAE6FD', red:'#E11D48', blue:'#1D4ED8' },
    dark:  { bg:'#030712', bg2:'#111827', bg3:'#1F2937', card:'#090E1A', card2:'#111827', text:'#F9FAFB', text2:'#9CA3AF', text3:'#4B5563', accent:'#06B6D4', accent2:'#22D3EE', accent3:'#34D399', border:'#1F2937', border2:'#374151', red:'#F43F5E', blue:'#3B82F6' },
  },
  cozy: {
    light: { bg:'#FFFBEB', bg2:'#FEF3C7', bg3:'#FDE68A', card:'#FFFFFF', card2:'#FFFDF5', text:'#451A03', text2:'#92400E', text3:'#D97706', accent:'#D97706', accent2:'#F59E0B', accent3:'#65A30D', border:'#FEF3C7', border2:'#FDE68A', red:'#B91C1C', blue:'#1D4ED8' },
    dark:  { bg:'#1C1917', bg2:'#292524', bg3:'#44403C', card:'#24211F', card2:'#292524', text:'#FFFBEB', text2:'#FDE68A', text3:'#B45309', accent:'#F59E0B', accent2:'#FBBF24', accent3:'#84CC16', border:'#44403C', border2:'#57534E', red:'#EF4444', blue:'#60A5FA' },
  },
  slate: {
    light: { bg:'#F8FAFC', bg2:'#F1F5F9', bg3:'#E2E8F0', card:'#FFFFFF', card2:'#F8FAFC', text:'#0F172A', text2:'#334155', text3:'#64748B', accent:'#475569', accent2:'#64748B', accent3:'#0F172A', border:'#E2E8F0', border2:'#CBD5E1', red:'#EF4444', blue:'#3B82F6' },
    dark:  { bg:'#0F172A', bg2:'#1E293B', bg3:'#334155', card:'#1E293B', card2:'#334155', text:'#F8FAFC', text2:'#94A3B8', text3:'#475569', accent:'#94A3B8', accent2:'#CBD5E1', accent3:'#F8FAFC', border:'#334155', border2:'#475569', red:'#F87171', blue:'#60A5FA' },
  },
  rose: {
    light: { bg:'#FFF1F2', bg2:'#FFE4E6', bg3:'#FECDD3', card:'#FFFFFF', card2:'#FFF7F8', text:'#4C0519', text2:'#9F1239', text3:'#FB7185', accent:'#E11D48', accent2:'#FB7185', accent3:'#D946EF', border:'#FFE4E6', border2:'#FECDD3', red:'#BE123C', blue:'#1D4ED8' },
    dark:  { bg:'#190412', bg2:'#2D061F', bg3:'#4A044E', card:'#250519', card2:'#2D061F', text:'#FFF1F2', text2:'#FB7185', text3:'#BE123C', accent:'#F43F5E', accent2:'#FB7185', accent3:'#E879F9', border:'#4A044E', border2:'#701A75', red:'#FB7185', blue:'#60A5FA' },
  },
  forest: {
    light: { bg:'#F7FEE7', bg2:'#ECFCCB', bg3:'#D9F99D', card:'#FFFFFF', card2:'#FBFEF1', text:'#1A2E05', text2:'#365314', text3:'#65A30D', accent:'#4D7C0F', accent2:'#65A30D', accent3:'#059669', border:'#ECFCCB', border2:'#D9F99D', red:'#B91C1C', blue:'#1D4ED8' },
    dark:  { bg:'#061A05', bg2:'#142D0D', bg3:'#1B430F', card:'#0E2211', card2:'#142D0D', text:'#F7FEE7', text2:'#A3E635', text3:'#65A30D', accent:'#84CC16', accent2:'#A3E635', accent3:'#10B981', border:'#1B430F', border2:'#365314', red:'#F87171', blue:'#60A5FA' },
  },
  dusk: {
    light: { bg:'#FAF5FF', bg2:'#F3E8FF', bg3:'#E9D5FF', card:'#FFFFFF', card2:'#FBF7FF', text:'#2E1065', text2:'#4C1D95', text3:'#7C3AED', accent:'#6D28D9', accent2:'#7C3AED', accent3:'#BE185D', border:'#F3E8FF', border2:'#E9D5FF', red:'#BE123C', blue:'#1D4ED8' },
    dark:  { bg:'#0F0720', bg2:'#1E1140', bg3:'#2E1065', card:'#170C31', card2:'#1E1140', text:'#FAF5FF', text2:'#C4B5FD', text3:'#7C3AED', accent:'#A78BFA', accent2:'#C4B5FD', accent3:'#F472B6', border:'#2E1065', border2:'#4C1D95', red:'#F43F5E', blue:'#60A5FA' },
  },
  nebula: {
    light: { bg:'#F5F3FF', bg2:'#EDE9FE', bg3:'#DDD6FE', card:'#FFFFFF', card2:'#F9F8FF', text:'#1E1B4B', text2:'#312E81', text3:'#6366F1', accent:'#4F46E5', accent2:'#6366F1', accent3:'#0EA5E9', border:'#EDE9FE', border2:'#DDD6FE', red:'#E11D48', blue:'#1D4ED8' },
    dark:  { bg:'#020617', bg2:'#0F172A', bg3:'#1E293B', card:'#0C1120', card2:'#0F172A', text:'#EEF2FF', text2:'#C7D2FE', text3:'#6366F1', accent:'#6366F1', accent2:'#818CF8', accent3:'#38BDF8', border:'#1E293B', border2:'#312E81', red:'#FB7185', blue:'#60A5FA' },
  },
};

export const THEME_META: Record<ThemeName, { label: string; swatchLight: string; swatchDark: string; description: string }> = {
  oxford:  { label: 'Oxford',  swatchLight: '#F8F5F0', swatchDark: '#8B4513', description: 'Academic warm parchment' },
  night:   { label: 'Night',   swatchLight: '#0F172A', swatchDark: '#38BDF8', description: 'Safe Slate & Deep Sea' },
  garden:  { label: 'Garden',  swatchLight: '#F0FDF4', swatchDark: '#10B981', description: 'Emerald Organic Soothing' },
  space:   { label: 'Space',   swatchLight: '#F0F9FF', swatchDark: '#0EA5E9', description: 'Deep Galactic Currents' },
  cozy:    { label: 'Cozy',    swatchLight: '#FFFBEB', swatchDark: '#D97706', description: 'Amber Fireside Comfort' },
  slate:   { label: 'Slate',   swatchLight: '#F8FAFC', swatchDark: '#475569', description: 'Professional minimalist' },
  rose:    { label: 'Rose',    swatchLight: '#FFF1F2', swatchDark: '#E11D48', description: 'Blush & Velvet Crimson' },
  forest:  { label: 'Forest',  swatchLight: '#F7FEE7', swatchDark: '#4D7C0F', description: 'Lush Woodland Canopy' },
  dusk:    { label: 'Dusk',    swatchLight: '#FAF5FF', swatchDark: '#6D28D9', description: 'Twilight Violet Aura' },
  nebula:  { label: 'Nebula',  swatchLight: '#F5F3FF', swatchDark: '#4F46E5', description: 'Cosmic Indigo Dream' },
};
