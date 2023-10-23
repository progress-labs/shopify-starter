export const spacing = [...Array(100).keys()].reduce(
  (a, v, idx) => ({...a, [idx * 5]: `${idx * 5}px`}),
  {},
);
