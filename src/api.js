const API_URL = process.env.YASNO_API_URL ||
  'https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/3/dsos/301/planned-outages';

async function fetchSchedule() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

module.exports = { fetchSchedule };
