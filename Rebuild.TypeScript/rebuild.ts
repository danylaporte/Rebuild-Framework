module rb {
    export enum CalendarWeekRule {
        firstDay = 0,
        firstFullWeek = 1,
        firstFourDayWeek = 2
    }

    export enum DayOfWeek {
        sunday = 0,
        monday = 1,
        tuesday = 2,
        wednesday = 3,
        thursday = 4,
        friday = 5,
        saturday = 6
    }

    export class DateTime {
        private static dayOfWeeks = [DayOfWeek.sunday, DayOfWeek.monday, DayOfWeek.tuesday, DayOfWeek.wednesday, DayOfWeek.thursday, DayOfWeek.friday, DayOfWeek.saturday];
        private static daysToMonth365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
        private static daysToMonth366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

        constructor(private ms: number) {
        }

        addDays(days: number) {
            return new DateTime(this.ms + days * 86400000);
        }

        addHours(hours: number) {
            return new DateTime(this.ms + hours * 3600000);
        }

        addMilliseconds(milliseconds: number) {
            return new DateTime(this.ms + milliseconds);
        }

        addMinutes(minutes: number) {
            return new DateTime(this.ms + minutes * 60000);
        }

        addMonths(months: number) {
            if (months < -120000 || months > 120000)
                throw new RangeException();

            var year = this.getDatePart(0);
            var month = this.getDatePart(2);
            var day = this.getDatePart(3);
            var num4 = month - 1 + months;

            if (num4 >= 0) {
                month = num4 % 12 + 1;
                year += Math.floor(num4 / 12);
            }
            else {
                month = 12 + (num4 + 1) % 12;
                year += Math.floor((num4 - 11) / 12);
            }

            if (year < 1 || year > 9999)
                throw new RangeException();

            var num5 = DateTime.daysInMonth(year, month);
            if (day > num5)
                day = num5;

            return new DateTime(DateTime.dateToTicks(year, month, day) + this.ms % 86400000);
        }

        addSeconds(seconds: number) {
            return new DateTime(this.ms + seconds * 1000);
        }

        addTimespan(timeSpan: TimeSpan) {
            return new DateTime(this.ms + timeSpan.getTotalMilliseconds());
        }

        addYears(value: number) {
            if (value < -10000 || value > 10000) {
                throw new RangeException();
            }
            return this.addMonths(value * 12);
        }

        compareTo(date: DateTime) {
            var v = date.valueOf();
            return this.ms > v ? 1 : (this.ms < v ? -1 : 0);
        }

        static dateToTicks(year: number, month: number, day: number) {
            if (year >= 1 && year <= 9999 && month >= 1 && month <= 12) {
                var array = DateTime.isLeapYear(year) ? DateTime.daysToMonth366 : DateTime.daysToMonth365;

                if (day >= 1 && day <= array[month] - array[month - 1]) {
                    var num = year - 1;
                    return (num * 365 + Math.floor(num / 4) - Math.floor(num / 100) + Math.floor(num / 400) + array[month - 1] + day - 1) * 86400000;
                }
            }
            throw new RangeException();
        }

        static daysInMonth(year: number, month: number) {
            if (month < 1 || month > 12)
                throw new RangeException();

            var array = DateTime.isLeapYear(year) ? DateTime.daysToMonth366 : DateTime.daysToMonth365;
            return array[month] - array[month - 1];
        }

        equals(date: DateTime) {
            return date.valueOf() == this.ms;
        }

        private static formatNumber2(n: number) {
            return n < 10 ? "0" + n : n.toString();
        }

        private static formatNumber4(n: number) {
            return n < 10 ? "000" + n : n < 100 ? "00" + n : n < 1000 ? "0" + n : n.toString();
        }

        static fromDate(year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number) {
            return new DateTime(DateTime.dateToTicks(year, month, day) + (hour | 0) * 3600000 + (minute | 0) * 60000 + (second | 0) * 1000 + (millisecond | 0));
        }

        static fromNativeDate(date: Date) {
            return new DateTime(date.valueOf() + 62135596800000 - date.getTimezoneOffset() * 60000);
        }

        getDate() {
            return new DateTime(this.ms - Math.floor(this.ms % 86400000));
        }

        private getDatePart(part: number) {
            var i = Math.floor(this.ms / 86400000);
            var num = Math.floor(i / 146097);
            i -= num * 146097;
            var num2 = Math.floor(i / 36524);

            if (num2 == 4)
                num2 = 3;

            i -= num2 * 36524;
            var num3 = Math.floor(i / 1461);
            i -= num3 * 1461;
            var num4 = Math.floor(i / 365);

            if (num4 == 4)
                num4 = 3;

            if (part == 0)
                return num * 400 + num2 * 100 + num3 * 4 + num4 + 1;

            i -= num4 * 365;
            if (part == 1)
                return i + 1;

            var array = num4 == 3 && (num3 != 24 || num2 == 3) ? DateTime.daysToMonth366 : DateTime.daysToMonth365;
            var num5 = i >> 6;
            while (i >= array[num5]) {
                num5++;
            }

            if (part == 2)
                return num5;

            return i - array[num5 - 1] + 1;
        }

        getDay() {
            return this.getDatePart(3);
        }

        getDayOfWeek() {
            return DateTime.dayOfWeeks[(Math.floor(this.ms / 86400000) + 1) % 7];
        }

        getDayOfYear() {
            return this.getDatePart(1);
        }

        getFirstDayOfMonth() {
            return DateTime.fromDate(this.getYear(), this.getMonth(), 1);
        }

        getFirstDayOfWeek(firstDayOfWeek = DayOfWeek.sunday) {
            var v = this.getDate();
            return v.getDayOfWeek() == firstDayOfWeek ? v : v.getPeviousDay(firstDayOfWeek);
        }

        getFirstDayOfYear() {
            return DateTime.fromDate(this.getYear(), 1, 1);
        }

        private getFirstDayWeekOfYear(firstDayOfWeek: DayOfWeek) {
            var dayOfYear = this.getDayOfYear() - 1;
            var w = this.getDayOfWeek() - (dayOfYear % 7);
            var i = (w - firstDayOfWeek + 14) % 7;
            return Math.floor((dayOfYear + i) / 7) + 1;
        }

        private getWeekOfYearFullDays(firstDayOfWeek: DayOfWeek, fullDays: number) {
            var num = this.getDayOfYear() - 1;
            var num2 = this.getDayOfWeek() - (num % 7);
            var num3 = (firstDayOfWeek - num2 + 14) % 7;
            if (num3 != 0 && num3 >= fullDays)
                num3 -= 7;

            var num4 = num - num3;
            if (num4 >= 0)
                return Math.floor(num4 / 7) + 1;

            if (this <= new DateTime(0).addDays(num)) {
                return this.getWeekOfYearOfMinSupportedDateTime(firstDayOfWeek, fullDays);
            }

            return this.addDays(-(num + 1)).getWeekOfYearFullDays(firstDayOfWeek, fullDays);
        }

        private getWeekOfYearOfMinSupportedDateTime(firstDayOfWeek: DayOfWeek, minimumDaysInFirstWeek: number) {
            var min = new DateTime(0);
            var num = min.getDayOfYear() - 1;
            var num2 = min.getDayOfWeek() - (num % 7);
            var num3 = (firstDayOfWeek + 7 - num2) % 7;

            if (num3 == 0 || num3 >= minimumDaysInFirstWeek)
                return 1;

            var num4 = 365 - 1;
            var num5 = num2 - 1 - num4 % 7;
            var num6 = (firstDayOfWeek - num5 + 14) % 7;
            var num7 = num4 - num6;

            if (num6 >= minimumDaysInFirstWeek)
                num7 += 7;

            return Math.floor(num7 / 7) + 1;
        }

        getHour() {
            return Math.floor(this.ms / 3600000) % 24;
        }

        getLastDayOfMonth() {
            return this.getFirstDayOfMonth().addMonths(1).addDays(-1);
        }

        getLastDayOfWeek(lastDayOfWeek = DayOfWeek.saturday) {
            var v = this.getDate();
            return v.getDayOfWeek() == lastDayOfWeek ? v : v.getNextDay(lastDayOfWeek);
        }

        getLastDayOfYear() {
            return DateTime.fromDate(this.getYear(), 12, 31);
        }

        getMillisecond() {
            return Math.floor(this.ms / 1000);
        }

        getMinute() {
            return Math.floor(this.ms / 60000) % 60;
        }

        getMonth() {
            return this.getDatePart(2);
        }

        getNextDay(dayOfWeek: DayOfWeek) {
            var v = Math.floor(this.getDayOfWeek() - dayOfWeek);
            return this.addDays(v >= 0 ? 7 - v : -v);
        }

        getNextDayOrValue(dayOfWeek: DayOfWeek) {
            return this.getDayOfWeek() == dayOfWeek ? this : this.getNextDay(dayOfWeek);
        }

        static getNow() {
            return DateTime.fromNativeDate(new Date());
        }

        getPeviousDay(dayOfWeek: DayOfWeek) {
            var v = Math.floor(dayOfWeek - this.getDayOfWeek());
            return this.addDays(v >= 0 ? v - 7 : v);
        }

        getPreviousDayOrValue(dayOfWeek: DayOfWeek) {
            return this.getDayOfWeek() == dayOfWeek ? this : this.getPeviousDay(dayOfWeek);
        }

        getSecond() {
            return Math.floor(this.ms / 1000) % 60;
        }

        getYear() {
            return this.getDatePart(0);
        }

        static isLeapYear(year: number) {
            if (year < 1 || year > 9999)
                throw new RangeException();

            return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
        }

        toString(format?: string) {
            return (format || "dd/MM/yyyy")
                .replace("dd", DateTime.formatNumber2(this.getDay()))
                .replace("d", this.getDay().toString())
                .replace("MM", DateTime.formatNumber2(this.getMonth()))
                .replace("M", this.getMonth().toString())
                .replace("yyyy", DateTime.formatNumber4(this.getYear()))
                .replace("yy", DateTime.formatNumber4(this.getYear() % 100))
                .replace("y", this.getYear().toString())
                .replace("hh", DateTime.formatNumber2(this.getHour()))
                .replace("h", this.getHour().toString())
                .replace("mm", DateTime.formatNumber2(this.getMinute()))
                .replace("m", this.getMinute().toString())
                .replace("ss", DateTime.formatNumber2(this.getSecond()))
                .replace("s", this.getSecond().toString());
        }

        valueOf() {
            return this.ms;
        }

        weekOfYear(rule?: CalendarWeekRule, firstDayOfWeek?: DayOfWeek) {
            firstDayOfWeek |= DayOfWeek.sunday;
            switch (rule) {
                case CalendarWeekRule.firstFullWeek:
                    return this.getWeekOfYearFullDays(firstDayOfWeek, 7);

                case CalendarWeekRule.firstFourDayWeek:
                    return this.getWeekOfYearFullDays(firstDayOfWeek, 4);

                default:
                    return this.getFirstDayWeekOfYear(firstDayOfWeek);
            }
        }
    }

    export class TimeSpan {
        private ms: number;

        constructor(milliseconds?: number) {
            this.ms = milliseconds | 0;
        }

        add(days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number) {
            return new TimeSpan(this.ms + TimeSpan.timeToMs(days, hours, minutes, seconds, milliseconds));
        }

        addSpan(ts: TimeSpan) {
            return new TimeSpan(this.ms + ts.ms);
        }

        duration() {
            return this.ms >= 0 ? this : new TimeSpan(-this.ms);
        }

        static from(days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number) {
            return new TimeSpan(TimeSpan.timeToMs(days, hours, minutes, seconds, milliseconds));
        }

        getDays() {
            return this.ms / 86400000;
        }

        getHours() {
            return Math.floor(this.ms / 3600000) % 24;
        }

        getMilliseconds() {
            return Math.floor(this.ms / 1000);
        }

        getMinutes() {
            return Math.floor(this.ms / 60000) % 60;
        }

        getSeconds() {
            return Math.floor(this.ms / 1000) % 60;
        }

        getTotalDays() {
            return this.ms * 1.1574074074074074E-8;
        }

        getTotalHours() {
            return this.ms * 2.7777777777777777E-7;
        }

        getTotalMilliseconds() {
            return this.ms;
        }

        getTotalMinutes() {
            return this.ms * 1.6666666666666667E-5;
        }

        getTotalSeconds() {
            return this.ms * 1E-3;
        }

        private static interval(value: number, scale: number) {
            return new TimeSpan(value * scale + (value >= 0.0 ? 0.5 : -0.5));
        }

        negate() {
            return new TimeSpan(-this.ms);
        }

        subtract(ts: TimeSpan) {
            return new TimeSpan(this.ms - ts.ms);
        }

        private static timeToMs(days: number, hours: number, minutes: number, seconds: number, milliseconds: number) {
            return ((days | 0) * 3600 * 24 + (hours | 0) * 3600 + (minutes | 0) * 60 + (seconds | 0)) * 1000 + (milliseconds | 0);
        }

        valueOf() {
            return this.ms;
        }
    }
}