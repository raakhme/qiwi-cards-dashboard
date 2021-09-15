import formatFns from "date-fns/format";
import ruLocale from "date-fns/locale/ru";

export const format = (
  date: Date,
  pattern: string,
  options: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: number;
    useAdditionalWeekYearTokens?: boolean;
    useAdditionalDayOfYearTokens?: boolean;
  } = {}
) => {
  return formatFns(date, pattern, {
    ...options,
    locale: ruLocale,
  });
};

export const toUTCISODate = (date: Date) => {
  return format(date, `yyyy-MM-dd'T'HH:mm:ssxxx`);
};
