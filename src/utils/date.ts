import format from "date-fns/format";

export const toUTCISODate = (date: Date) => {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  return format(date, `yyyy-MM-dd'T'HH:mm:ssxxx`);

  return (
    format(date, `yyyy-MM-dd'T'`) +
    `${hours}:${minutes}:${seconds}` +
    format(date, `xxx`)
  );
};
