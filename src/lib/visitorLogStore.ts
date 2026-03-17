import { VisitorEntry, generateMockVisitors } from './mockData';

// Shared in-memory store for visitor logs
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

export function addLog(entry: VisitorEntry) {
  allLogs = [entry, ...allLogs];
  notify();
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
