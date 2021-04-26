module.exports = function secondsToTime(seconds) {
  let hh = Math.floor(seconds / 3600);
  let mm = Math.floor((seconds - (hh * 3600)) / 60);
  let ss = seconds - (hh * 3600) - (mm * 60);

  if (hh < 10) hh = `0${hh}`;
  if (mm < 10) mm = `0${mm}`;
  if (ss < 10) ss = `0${ss}`;

  return `${hh}:${mm}:${ss}`;
};
