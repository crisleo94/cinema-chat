// const moment = require('moment')
const mtz = require('moment-timezone')

function formatMessage(username, text) {
  const userTimeZone = 'America/Bogota'
  return {
    username,
    text,
    time: mtz.tz(userTimeZone).format('h:mm a')
  }
}

module.exports = formatMessage
