const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedule.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUsers() {
  return readJSON(USERS_FILE) || {};
}

function setUser(chatId, group) {
  const users = getUsers();
  users[chatId] = { group, subscribedAt: new Date().toISOString() };
  writeJSON(USERS_FILE, users);
}

function removeUser(chatId) {
  const users = getUsers();
  delete users[chatId];
  writeJSON(USERS_FILE, users);
}

function getSchedule() {
  return readJSON(SCHEDULE_FILE);
}

function saveSchedule(data) {
  writeJSON(SCHEDULE_FILE, { data, fetchedAt: new Date().toISOString() });
}

module.exports = { getUsers, setUser, removeUser, getSchedule, saveSchedule };
