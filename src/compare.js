function dayChanged(oldDay, newDay) {
  if (!oldDay && !newDay) return false;
  if (!oldDay || !newDay) return true;
  if (oldDay.status !== newDay.status) return true;
  return JSON.stringify(oldDay.slots) !== JSON.stringify(newDay.slots);
}

function findChanges(oldData, newData) {
  if (!oldData) return {};

  const changes = {};

  for (const group of Object.keys(newData)) {
    const oldGroup = oldData[group];
    const newGroup = newData[group];

    if (!oldGroup) {
      changes[group] = { today: true, tomorrow: true };
      continue;
    }

    const todayChanged = dayChanged(oldGroup.today, newGroup.today);
    const tomorrowChanged = dayChanged(oldGroup.tomorrow, newGroup.tomorrow);

    if (todayChanged || tomorrowChanged) {
      changes[group] = { today: todayChanged, tomorrow: tomorrowChanged };
    }
  }

  return changes;
}

module.exports = { findChanges };
