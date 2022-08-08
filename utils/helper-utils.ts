let interv = null;
export function timedoutUpdate(fn: (...args: any[]) => void, timeout: number = 1000) {
  if (interv != null) window.clearTimeout(interv);
  interv = window.setTimeout(fn, timeout);
}
