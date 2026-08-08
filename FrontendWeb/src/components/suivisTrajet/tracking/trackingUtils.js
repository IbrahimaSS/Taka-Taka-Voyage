export const isValidCoords = (pos) => {
  if (!pos) return false;
  if (Array.isArray(pos)) {
    return pos.length === 2 && pos[0] !== null && pos[1] !== null && !isNaN(pos[0]) && !isNaN(pos[1]);
  }
  if (typeof pos === 'object') {
    return pos.lat !== null && pos.lng !== null && !isNaN(pos.lat) && !isNaN(pos.lng);
  }
  return false;
};
