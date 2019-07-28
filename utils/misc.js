
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