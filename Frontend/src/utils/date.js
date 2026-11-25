// Patient's local calendar day as "YYYY-MM-DD". Sent to the API so streaks
// and "done today" follow the patient's timezone, not the server's.
export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateKey = (key, opts = { month: 'short', day: 'numeric' }) => {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
};

export const formatDuration = (seconds = 0) => {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
};

export const daysAgoLabel = (n) => (n === 0 ? 'Today' : n === 1 ? 'Yesterday' : `${n} days ago`);
