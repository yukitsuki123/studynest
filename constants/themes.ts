import { ThemeName, ThemeColors } from './types';

export const THEMES: Record<ThemeName, { light: ThemeColors; dark: ThemeColors }> = {
  oxford: {
    light: { bg:'#F5F0E8',bg2:'#EDE8DC',bg3:'#E2DBCC',card:'#FAF7F2',card2:'#F0EBE0',text:'#1A1208',text2:'#4A3F2F',text3:'#7A6E5F',accent:'#8B4513',accent2:'#C5813A',accent3:'#4A7C59',border:'#C8BEA8',border2:'#D8CEB8',red:'#C0392B',blue:'#2C5F8A' },
    dark:  { bg:'#120E08',bg2:'#1C1610',bg3:'#261E16',card:'#1A1410',card2:'#221A14',text:'#F0EAE0',text2:'#C8B89A',text3:'#8A7A6A',accent:'#D4703A',accent2:'#E89A5A',accent3:'#6AA07A',border:'#3A3028',border2:'#4A4038',red:'#E05050',blue:'#5A90C0' },
  },
  night: {
    light: { bg:'#E8ECF8',bg2:'#D8DEEE',bg3:'#C8D0E4',card:'#F0F2FC',card2:'#E0E6F4',text:'#0A0E20',text2:'#2A3050',text3:'#6A7090',accent:'#3A5AB4',accent2:'#5A7AD4',accent3:'#3A8090',border:'#A8B4D0',border2:'#B8C4E0',red:'#C03040',blue:'#2050A0' },
    dark:  { bg:'#0D0F1A',bg2:'#141728',bg3:'#1A1D35',card:'#181B2E',card2:'#1E2238',text:'#E8ECF5',text2:'#A0AACC',text3:'#5A6480',accent:'#7B8FD4',accent2:'#9BB0F0',accent3:'#5A8FA0',border:'#2A2F4A',border2:'#323858',red:'#E05A6A',blue:'#5A90D4' },
  },
  garden: {
    light: { bg:'#EFF5EC',bg2:'#E2EFDD',bg3:'#D5E8CE',card:'#F8FCF6',card2:'#EDFAE8',text:'#1A2A18',text2:'#3A5A38',text3:'#6A8A68',accent:'#3A7A4A',accent2:'#5A9A5A',accent3:'#8AB040',border:'#B8D8B0',border2:'#C8E8C0',red:'#C05040',blue:'#3A6080' },
    dark:  { bg:'#0C1408',bg2:'#121C0E',bg3:'#182414',card:'#101810',card2:'#162016',text:'#E0F0DC',text2:'#9AB898',text3:'#5A7858',accent:'#5AAA6A',accent2:'#7AC87A',accent3:'#A0CC50',border:'#283828',border2:'#344838',red:'#E06050',blue:'#5A90A0' },
  },
  space: {
    light: { bg:'#E8F0F8',bg2:'#D0DCF0',bg3:'#B8C8E8',card:'#F0F4FC',card2:'#E0E8F8',text:'#080C20',text2:'#203060',text3:'#508090',accent:'#0080CC',accent2:'#20A0E0',accent3:'#30B060',border:'#90B0D0',border2:'#A8C4E0',red:'#E03050',blue:'#1060CC' },
    dark:  { bg:'#080C12',bg2:'#0E1420',bg3:'#141C2E',card:'#0E1420',card2:'#141C2E',text:'#D0E8FF',text2:'#7090B0',text3:'#3A5070',accent:'#00BFFF',accent2:'#40D0FF',accent3:'#80FF90',border:'#1A2A3A',border2:'#203040',red:'#FF4060',blue:'#2080FF' },
  },
  cozy: {
    light: { bg:'#FDF6EE',bg2:'#F5E9D8',bg3:'#EDD9C0',card:'#FFF9F2',card2:'#F8EEE0',text:'#2C1A0E',text2:'#5C3D22',text3:'#9C7A5A',accent:'#C0622A',accent2:'#E8884A',accent3:'#5A8A4A',border:'#DEC4A0',border2:'#E8D4B8',red:'#C03020',blue:'#3A5888' },
    dark:  { bg:'#1A1008',bg2:'#261810',bg3:'#322018',card:'#201408',card2:'#2C1C10',text:'#F4E8D8',text2:'#D4B898',text3:'#9A7858',accent:'#E07840',accent2:'#F0A060',accent3:'#70A858',border:'#4A3020',border2:'#5A3C28',red:'#E04030',blue:'#5080B0' },
  },
  // ── New smooth/easy-on-eyes themes ──────────────────────────────────────────
  slate: {
    light: { bg:'#F0F4F8',bg2:'#E2E8F0',bg3:'#CBD5E1',card:'#F8FAFC',card2:'#EEF2F7',text:'#0F172A',text2:'#334155',text3:'#64748B',accent:'#4F6EF7',accent2:'#7C8FF8',accent3:'#10B981',border:'#CBD5E1',border2:'#E2E8F0',red:'#EF4444',blue:'#3B5BDB' },
    dark:  { bg:'#0F172A',bg2:'#1E293B',bg3:'#263245',card:'#1E293B',card2:'#263245',text:'#F1F5F9',text2:'#94A3B8',text3:'#475569',accent:'#818CF8',accent2:'#A5B4FC',accent3:'#34D399',border:'#263245',border2:'#334155',red:'#F87171',blue:'#60A5FA' },
  },
  rose: {
    light: { bg:'#FFF1F3',bg2:'#FFE4E8',bg3:'#FECDD3',card:'#FFF8F9',card2:'#FFECEF',text:'#1A0A0D',text2:'#6B2737',text3:'#9F7680',accent:'#E11D48',accent2:'#FB7185',accent3:'#D97706',border:'#FECDD3',border2:'#FFD6DB',red:'#BE123C',blue:'#2563EB' },
    dark:  { bg:'#1A060A',bg2:'#2D0F16',bg3:'#3D1622',card:'#230C12',card2:'#331018',text:'#FFF1F3',text2:'#FECDD3',text3:'#9F7680',accent:'#FB7185',accent2:'#FDA4AF',accent3:'#FCD34D',border:'#4C1628',border2:'#5C1E30',red:'#F43F5E',blue:'#60A5FA' },
  },
  forest: {
    light: { bg:'#F0F7F0',bg2:'#DCF0DC',bg3:'#C4E4C4',card:'#F6FCF6',card2:'#EAFAEA',text:'#071A07',text2:'#1E4D1E',text3:'#4A7A4A',accent:'#166534',accent2:'#22C55E',accent3:'#CA8A04',border:'#BBD6BB',border2:'#CCE4CC',red:'#DC2626',blue:'#1D4ED8' },
    dark:  { bg:'#071A07',bg2:'#0F2D0F',bg3:'#163F16',card:'#0D240D',card2:'#132E13',text:'#ECFDF5',text2:'#86EFAC',text3:'#4ADE80',accent:'#4ADE80',accent2:'#86EFAC',accent3:'#FDE047',border:'#14532D',border2:'#166534',red:'#F87171',blue:'#60A5FA' },
  },
  dusk: {
    light: { bg:'#FAF5FF',bg2:'#F3E8FF',bg3:'#E9D5FF',card:'#FDFAFF',card2:'#F5EEFF',text:'#1A0A2E',text2:'#4C1D95',text3:'#7C3AED',accent:'#7C3AED',accent2:'#A78BFA',accent3:'#059669',border:'#DDD6FE',border2:'#EDE9FE',red:'#DC2626',blue:'#2563EB' },
    dark:  { bg:'#0D0618',bg2:'#160A28',bg3:'#1E1038',card:'#130720',card2:'#1A0E30',text:'#FAF5FF',text2:'#C4B5FD',text3:'#7C3AED',accent:'#A78BFA',accent2:'#C4B5FD',accent3:'#34D399',border:'#2E1065',border2:'#3B1075',red:'#F87171',blue:'#818CF8' },
  },
};

export const THEME_META: Record<ThemeName, { label: string; swatchLight: string; swatchDark: string; description: string }> = {
  oxford:  { label: 'Oxford',  swatchLight: '#F5F0E8', swatchDark: '#8B4513', description: 'Warm parchment & ink' },
  night:   { label: 'Night',   swatchLight: '#0D0F1A', swatchDark: '#7B8FD4', description: 'Deep navy & silver' },
  garden:  { label: 'Garden',  swatchLight: '#EFF5EC', swatchDark: '#3A7A4A', description: 'Sage greens & cream' },
  space:   { label: 'Space',   swatchLight: '#080C12', swatchDark: '#00BFFF', description: 'Dark charcoal & cyan' },
  cozy:    { label: 'Cozy',    swatchLight: '#FDF6EE', swatchDark: '#C0622A', description: 'Amber & terracotta' },
  slate:   { label: 'Slate',   swatchLight: '#F0F4F8', swatchDark: '#4F6EF7', description: 'Clean blue-grey' },
  rose:    { label: 'Rose',    swatchLight: '#FFF1F3', swatchDark: '#E11D48', description: 'Soft rose & blush' },
  forest:  { label: 'Forest',  swatchLight: '#F0F7F0', swatchDark: '#166534', description: 'Deep greens & gold' },
  dusk:    { label: 'Dusk',    swatchLight: '#FAF5FF', swatchDark: '#7C3AED', description: 'Lavender & violet' },
};
