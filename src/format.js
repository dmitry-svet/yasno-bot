function minutesToTime(m) {
  const hours = String(Math.floor(m / 60) % 24).padStart(2, '0');
  const mins = String(m % 60).padStart(2, '0');
  return `${hours}:${mins}`;
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
    .map(s => `  ${minutesToTime(s.start)}-${minutesToTime(s.end)}  ${slotTypeLabel(s.type)}`)
    .join('\n');
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

  if (groupData.updatedOn) {
    lines.push('', `Updated: ${formatUpdatedOn(groupData.updatedOn)}`);
  }

  return lines.join('\n');
}

function formatChangeNotification(group, groupData) {
  return `Schedule changed for group ${group}!\n\n${formatSchedule(group, groupData)}`;
}

module.exports = { formatSchedule, formatChangeNotification };
