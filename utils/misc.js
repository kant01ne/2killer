
const getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
}
exports.getRandomInt = getRandomInt;

exports.getRandomItem = function (array) {
  const id = getRandomInt(array.length - 1);
  return array[id];
}

Array.prototype.swap = function (x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
}

exports.bgColors = [
  "#000",
  "#1f1f1f",
  "#333232",
  "#351d1d",
  "#493737",
  "#5c5c5c",
  "#100a0a",
  "#5c0000",
  "#8b3838",
  "#1c1010"
]