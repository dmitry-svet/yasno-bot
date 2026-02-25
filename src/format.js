const TZ = 'Europe/Kyiv';

function nowInUA() {
  const parts = new Date().toLocaleString('en-GB', { timeZone: TZ, hour12: false }).split(/[\s,:\/]+/);
  return { hours: Number(parts[3]), minutes: Number(parts[4]) };
}

function minutesToTime(m) {
  const hours = String(Math.floor(m / 60) % 24).padStart(2, '0');
  const mins = String(m % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

function formatDuration(startMin, endMin) {
  const diff = endMin - startMin;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

function slotTypeLabel(type) {
  if (type === 'Definite') return 'OFF';
  if (type === 'NotPlanned') return '--';
  return 'possibly off';
}

function formatSlot(s) {
  const dur = formatDuration(s.start, s.end);
  return `  ${minutesToTime(s.start)}-${minutesToTime(s.end)}  ${slotTypeLabel(s.type)} ${dur}`;
}

function slotChanged(slot, oldSlots) {
  if (!oldSlots) return true;
  const match = oldSlots.find(o => o.start === slot.start && o.end === slot.end);
  if (!match) return true;
  return match.type !== slot.type;
}

function formatDay(dayData, { oldDayData } = {}) {
  if (!dayData) return '  No data';
  if (dayData.status === 'WaitingForSchedule') return '  Waiting for schedule...';

  return dayData.slots
    .map(s => {
      const line = formatSlot(s);
      return oldDayData && slotChanged(s, oldDayData.slots) ? `<b>${line}</b>` : line;
    })
    .join('\n');
}

function findNextOff(groupData) {
  const ua = nowInUA();
  const nowMinutes = ua.hours * 60 + ua.minutes;

  if (groupData.today?.status === 'ScheduleApplies') {
    for (const s of groupData.today.slots) {
      if (s.type === 'Definite' && s.start > nowMinutes) {
        return { day: 'today', minutesUntil: s.start - nowMinutes };
      }
    }
  }

  if (groupData.tomorrow?.status === 'ScheduleApplies') {
    for (const s of groupData.tomorrow.slots) {
      if (s.type === 'Definite') {
        const minutesUntil = (1440 - nowMinutes) + s.start;
        return { day: 'tomorrow', minutesUntil };
      }
    }
  }

  return null;
}

function formatTimeUntil(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const day = String(d.toLocaleString('en-GB', { timeZone: TZ, day: '2-digit' }));
  const month = String(d.toLocaleString('en-GB', { timeZone: TZ, month: '2-digit' }));
  return `${day}.${month}`;
}

function formatUpdatedOn(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('en-GB', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '').replace(/\//g, '.');
}

function formatSchedule(group, groupData, oldGroupData) {
  const todayDate = groupData.today?.date ? ` (${formatDate(groupData.today.date)})` : '';
  const tomorrowDate = groupData.tomorrow?.date ? ` (${formatDate(groupData.tomorrow.date)})` : '';

  const lines = [
    `Group ${group} — Schedule`,
    '',
    `Today${todayDate}:`,
    formatDay(groupData.today, { oldDayData: oldGroupData?.today }),
    '',
    `Tomorrow${tomorrowDate}:`,
    formatDay(groupData.tomorrow, { oldDayData: oldGroupData?.tomorrow }),
  ];

  const nextOff = findNextOff(groupData);
  if (nextOff) {
    lines.push('', `Going off in ${formatTimeUntil(nextOff.minutesUntil)}`);
  }

  if (groupData.updatedOn) {
    lines.push('', `Updated: ${formatUpdatedOn(groupData.updatedOn)}`);
  }

  return lines.join('\n');
}

function formatChangeNotification(group, groupData, oldGroupData) {
  return `Schedule changed for group ${group}!\n\n${formatSchedule(group, groupData, oldGroupData)}`;
}

module.exports = { formatSchedule, formatChangeNotification };
