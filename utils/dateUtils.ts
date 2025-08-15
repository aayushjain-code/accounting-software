// Date utility functions

import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  addDays,
  subDays,
  differenceInDays,
} from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BusinessDateOptions {
  includeWeekends?: boolean;
  holidays?: Date[];
  workingDaysPerWeek?: number;
}

export interface DateFormatOptions {
  format?: string;
  locale?: Locale;
  includeTime?: boolean;
  timeFormat?: "12h" | "24h";
}

/**
 * Date validation utilities
 */
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && isValid(date);
};

export const isValidDateString = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isValid(date);
};

export const parseDate = (date: string | Date | number): Date | null => {
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }
  if (typeof date === "string") {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  }
  if (typeof date === "number") {
    const parsed = new Date(date);
    return isValid(parsed) ? parsed : null;
  }
  return null;
};

/**
 * Date formatting utilities
 */
export const formatDate = (
  date: Date | string | number,
  formatString: string = "yyyy-MM-dd"
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "Invalid Date";

  try {
    return format(parsedDate, formatString);
  } catch {
    return "Invalid Date";
  }
};

export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  formatString: string = "yyyy-MM-dd"
): string => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return "Invalid Date Range";

  return `${formatDate(start, formatString)} - ${formatDate(end, formatString)}`;
};

export const formatRelativeDate = (date: Date | string | number): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "Invalid Date";

  const now = new Date();
  const diffInDays = differenceInDays(now, parsedDate);

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays === -1) return "Tomorrow";
  if (diffInDays > 0) return `${diffInDays} days ago`;
  if (diffInDays < 0) return `In ${Math.abs(diffInDays)} days`;

  return formatDate(parsedDate, "MMM dd, yyyy");
};

/**
 * Business date utilities
 */
export const isBusinessDay = (
  date: Date,
  options: BusinessDateOptions = {}
): boolean => {
  const { includeWeekends = false, holidays = [] } = options;

  if (!includeWeekends && isWeekend(date)) {
    return false;
  }

  if (
    holidays.some(
      holiday => format(holiday, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    )
  ) {
    return false;
  }

  return true;
};

export const getBusinessDays = (
  startDate: Date,
  endDate: Date,
  options: BusinessDateOptions = {}
): Date[] => {
  const { includeWeekends = false, holidays = [] } = options;

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.filter(day => {
    if (!includeWeekends && isWeekend(day)) {
      return false;
    }

    if (
      holidays.some(
        holiday => format(holiday, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      )
    ) {
      return false;
    }

    return true;
  });
};

export const getBusinessDaysCount = (
  startDate: Date,
  endDate: Date,
  options: BusinessDateOptions = {}
): number => {
  return getBusinessDays(startDate, endDate, options).length;
};

export const addBusinessDays = (
  date: Date,
  days: number,
  options: BusinessDateOptions = {}
): Date => {
  let result = new Date(date);
  let remainingDays = Math.abs(days);
  const direction = days > 0 ? 1 : -1;

  while (remainingDays > 0) {
    result = addDays(result, direction);
    if (isBusinessDay(result, options)) {
      remainingDays--;
    }
  }

  return result;
};

export const subtractBusinessDays = (
  date: Date,
  days: number,
  options: BusinessDateOptions = {}
): Date => {
  return addBusinessDays(date, -days, options);
};

/**
 * Month utilities
 */
export const getMonthRange = (year: number, month: number): DateRange => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return { start, end };
};

export const getMonthBusinessDays = (
  year: number,
  month: number,
  options: BusinessDateOptions = {}
): Date[] => {
  const { start, end } = getMonthRange(year, month);
  return getBusinessDays(start, end, options);
};

export const getMonthBusinessDaysCount = (
  year: number,
  month: number,
  options: BusinessDateOptions = {}
): number => {
  return getMonthBusinessDays(year, month, options).length;
};

/**
 * Fiscal year utilities
 */
export const getFiscalYear = (
  date: Date,
  fiscalYearStartMonth: number = 4
): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= fiscalYearStartMonth) {
    return year;
  }
  return year - 1;
};

export const getFiscalYearRange = (
  fiscalYear: number,
  fiscalYearStartMonth: number = 4
): DateRange => {
  const start = new Date(fiscalYear, fiscalYearStartMonth - 1, 1);
  const end = new Date(fiscalYear + 1, fiscalYearStartMonth - 1, 0);
  return { start, end };
};

/**
 * Age calculation
 */
export const calculateAge = (
  birthDate: Date,
  referenceDate: Date = new Date()
): number => {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && reference.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Date comparison utilities
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isYesterday = (date: Date): boolean => {
  return isSameDay(date, subDays(new Date(), 1));
};

export const isTomorrow = (date: Date): boolean => {
  return isSameDay(date, addDays(new Date(), 1));
};

export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  return date >= weekStart && date <= weekEnd;
};

export const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const isThisYear = (date: Date): boolean => {
  return date.getFullYear() === new Date().getFullYear();
};

// Helper functions for week operations
const startOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

const endOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + 6;
  return new Date(date.setDate(diff));
};
