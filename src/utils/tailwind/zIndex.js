const base = {
  "z-omg": 99999,
};

export const zIndex = Object.assign(
  [...Array(21).keys()].reduce((a, v, idx) => ({...a, [idx * 5]: idx * 5}), {}),
  base,
);
