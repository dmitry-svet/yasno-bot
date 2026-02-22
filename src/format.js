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

function formatDay(dayData) {
  if (!dayData) return '  No data';
  if (dayData.status === 'WaitingForSchedule') return '  Waiting for schedule...';

  return dayData.slots
    .map(s => {
      const dur = formatDuration(s.start, s.end);
      return `  ${minutesToTime(s.start)}-${minutesToTime(s.end)}  ${slotTypeLabel(s.type)} (${dur})`;
    })
    .join('\n');
}

function findNextOff(groupData) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

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
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

function formatUpdatedOn(isoString) {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month} ${hours}:${mins}`;
}

function formatSchedule(group, groupData) {
  const todayDate = groupData.today?.date ? ` (${formatDate(groupData.today.date)})` : '';
  const tomorrowDate = groupData.tomorrow?.date ? ` (${formatDate(groupData.tomorrow.date)})` : '';

  const lines = [
    `Group ${group} — Schedule`,
    '',
    `Today${todayDate}:`,
    formatDay(groupData.today),
    '',
    `Tomorrow${tomorrowDate}:`,
    formatDay(groupData.tomorrow),
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

function formatChangeNotification(group, groupData) {
  return `Schedule changed for group ${group}!\n\n${formatSchedule(group, groupData)}`;
}

module.exports = { formatSchedule, formatChangeNotification };
