export function formatData(mb) {
  if (mb >= 1024) {
    const gb = mb / 1024;

    return `${gb.toFixed(gb >= 10 ? 1 : 2)} GB`;
  }

  return `${Math.round(mb)} MB`;
}