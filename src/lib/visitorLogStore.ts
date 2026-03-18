import { VisitorEntry, generateMockVisitors } from './mockData';

let allLogs: VisitorEntry[] = generateMockVisitors(250);
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(fn => fn());
}

export function getAllLogs(): VisitorEntry[] {
  return allLogs;
}

export function getLogsByEmail(email: string): VisitorEntry[] {
  return allLogs.filter(v => v.userEmail === email);
}

export function getUniqueUsers(): { email: string; name: string; visitCount: number; lastVisit: Date }[] {
  const userMap = new Map<string, { name: string; count: number; lastVisit: Date }>();
  allLogs.forEach(v => {
    if (!v.userEmail) return;
    const existing = userMap.get(v.userEmail);
    if (!existing) {
      userMap.set(v.userEmail, { name: v.name, count: 1, lastVisit: v.timestamp });
    } else {
      existing.count++;
      if (v.timestamp > existing.lastVisit) {
        existing.lastVisit = v.timestamp;
        existing.name = v.name;
      }
    }
  });
  return Array.from(userMap.entries())
    .map(([email, data]) => ({ email, name: data.name, visitCount: data.count, lastVisit: data.lastVisit }))
    .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
}

export function addLog(entry: VisitorEntry) {
  allLogs = [entry, ...allLogs];
  notify();
}

export function updateLog(id: string, updates: Partial<VisitorEntry>) {
  allLogs = allLogs.map(v => v.id === id ? { ...v, ...updates } : v);
  notify();
}

export function deleteLog(id: string) {
  allLogs = allLogs.filter(v => v.id !== id);
  notify();
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
