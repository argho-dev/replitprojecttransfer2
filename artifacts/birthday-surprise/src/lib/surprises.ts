export const PERSONAL_MESSAGES: string[] = [
  "You have a really beautiful way of making people feel comfortable 🌸",
  "Your presence makes things feel lighter and happier 💛",
  "You notice things others miss — and that makes you extra special ✨",
  "The way you carry yourself is genuinely inspiring 🌟",
  "You bring a kind of calm that's hard to find anywhere else 🌙",
  "People around you are lucky, even if they don't always say it ❤️",
  "You have this rare ability to understand others without them having to explain 🌸",
  "Not everyone gets to know someone as thoughtful as you 💛",
  "You handle hard things with a grace that's worth admiring ✨",
  "Your kindness isn't small — it leaves a real mark on people 🌟",
  "There's a warmth in you that feels rare and wonderful 🌙",
  "You see the good in things — and that's a gift not everyone has ❤️",
  "The world feels a little better with you in it 🌸",
  "Your energy is one of a kind, and people feel it immediately 💛",
  "You're one of those people who makes a difference just by being present ✨",
  "You carry a quiet strength that shows in everything you do 🌟",
  "The way you make others feel seen is genuinely rare 🌙",
  "You deserve every good thing coming your way ❤️",
  "Your smile has a way of making an entire room feel warmer 🌸",
  "You're more appreciated than you probably realize 💛",
];

const BIRTHDAY_MESSAGES: string[] = [
  "Happy Birthday 🎉",
  "You are precious to me, always be happy 💛",
];

export const SURPRISE_MODULES = [
  'fireflies',
  'heartGame',
  'loveLetter',
  'floatingBears',
  'emojiRain',
  'messageWall',
  'starConstellation',
  'bubbleMessages',
  'walkingBears',
  'heartCanvas',
  'glowingOrbs',
  'petals',
  'neonMessage',
  'musicBox',
  'mirrorMirror',
];

export const BIRTHDAY = new Date(2026, 2, 31);

export function getBirthdayTarget(): Date {
  const now = new Date();
  const target = new Date(now.getFullYear(), 2, 31, 0, 0, 0, 0);
  if (now >= target) target.setFullYear(target.getFullYear() + 1);
  return target;
}

export function getDaysUntilBirthday(): number {
  const diff = getBirthdayTarget().getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getCountdownParts(): { days: number; hours: number; minutes: number; seconds: number } {
  const diff = Math.max(0, getBirthdayTarget().getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  const days    = Math.floor(totalSecs / 86400);
  const hours   = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { days, hours, minutes, seconds };
}

export function isBirthday(): boolean {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 31;
}

export function isBirthdayEve(): boolean {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 30 && now.getHours() === 23 && now.getMinutes() >= 50;
}

function dayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

export function getTodaySurpriseIndex(): number {
  const key = dayKey();

  const storedDate = localStorage.getItem('bday_surpriseDate');
  const storedIdx  = localStorage.getItem('bday_surpriseIdx');
  if (storedDate === key && storedIdx !== null) {
    return parseInt(storedIdx, 10);
  }

  const seenRaw = localStorage.getItem('bday_seenModules');
  let seen: number[] = seenRaw ? JSON.parse(seenRaw) : [];

  if (seen.length >= SURPRISE_MODULES.length) seen = [];

  const available = SURPRISE_MODULES.map((_, i) => i).filter(i => !seen.includes(i));
  const pick      = available[Math.floor(Math.random() * available.length)];

  seen.push(pick);
  localStorage.setItem('bday_seenModules',  JSON.stringify(seen));
  localStorage.setItem('bday_surpriseIdx',  String(pick));
  localStorage.setItem('bday_surpriseDate', key);

  return pick;
}

export function getTodayMessages(): string[] {
  if (isBirthday()) return BIRTHDAY_MESSAGES;

  const key = dayKey();

  const storedDate = localStorage.getItem('bday_msgDate');
  const storedMsgs = localStorage.getItem('bday_msgTexts');
  if (storedDate === key && storedMsgs) {
    try {
      const parsed = JSON.parse(storedMsgs);
      if (Array.isArray(parsed) && parsed.length === 2) return parsed;
    } catch {
    }
  }

  const seenRaw = localStorage.getItem('bday_seenMsgs');
  let seen: number[] = seenRaw ? JSON.parse(seenRaw) : [];

  if (seen.length >= PERSONAL_MESSAGES.length - 1) seen = [];

  const available = PERSONAL_MESSAGES.map((_, i) => i).filter(i => !seen.includes(i));

  const pick1 = available[Math.floor(Math.random() * available.length)];
  const remaining = available.filter(i => i !== pick1);
  const pick2 = remaining[Math.floor(Math.random() * remaining.length)] ?? pick1;

  const msgs = [PERSONAL_MESSAGES[pick1], PERSONAL_MESSAGES[pick2]];

  seen.push(pick1, pick2);
  localStorage.setItem('bday_seenMsgs',  JSON.stringify(seen));
  localStorage.setItem('bday_msgTexts',  JSON.stringify(msgs));
  localStorage.setItem('bday_msgDate',   key);

  return msgs;
}

export function getTodayMessage(): string {
  return getTodayMessages()[0];
}
