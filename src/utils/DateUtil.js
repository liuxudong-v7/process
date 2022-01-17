var now = new Date(); // 当前日期
var nowDayOfWeek = now.getDay(); // 今天本周的第几天
var nowDay = now.getDate(); // 当前日
var nowMonth = now.getMonth(); // 当前月
var nowYear = now.getYear(); // 当前年
nowYear += nowYear < 2000 ? 1900 : 0;

var DateUtil = {
  /**
   * 是否闰年
   */
  isLeapYear: function (year) {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
  },
  /**
   * @param 日期格式化
   * @returns {String}
   */
  formatDate(date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();
    if (mymonth < 10) {
      mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
      myweekday = "0" + myweekday;
    }
    return myyear + "-" + mymonth + "-" + myweekday;
  },
  /**
   * @param 时间格式化
   * @returns {String}
   */
  formatTime(date) {
    let hours = date.getHours().toString();
    if (hours < 10) {
      hours = "0" + hours;
    }
    let minutes = date.getMinutes().toString();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    let seconds = date.getSeconds().toString();
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
  },
  dateToString: function (date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = (date.getDate()).toString();
    if (month.length == 1) {
      month = "0" + month;
    }
    if (day.length == 1) {
      day = "0" + day;
    }
    var dateTime = year + "-" + month + "-" + day;
    return dateTime;
  },
  stringToDate: function (dateStr, separator) {
    if (!separator) {
      separator = "-";
    }
    var dateArr = dateStr.split(separator);
    var year = parseInt(dateArr[0]);
    var month;
    //处理月份为04这样的情况
    if (dateArr[1].indexOf("0") == 0) {
      month = parseInt(dateArr[1].substring(1));
    } else {
      month = parseInt(dateArr[1]);
    }
    var day = parseInt(dateArr[2]);
    var date = new Date(year, month - 1, day);
    return date;
  },
  /**
   * 获取当前日期和时间串(YYYY-MM-DD HH:MM:SS)
   * @returns {string}
   */
  getCurrentTime() {
    var myDate = new Date();
    var year = myDate.getFullYear(); //获取当前年
    var month = myDate.getMonth() + 1; //获取当前月
    if (month < 10) {
      month = "0" + month;
    }
    var date = myDate.getDate(); //获取当前日
    if (date < 10) {
      date = "0" + date;
    }
    var hours = myDate.getHours(); //获取当前小时
    if (hours < 10) {
      hours = "0" + hours;
    }
    var minutes = myDate.getMinutes(); //获取当前分钟
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var seconds = myDate.getSeconds(); //获取当前秒
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var now = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return now;
  },
  /**
   * 获得当前日期串(YYYY-MM-DD)
   * @returns {string}
   */
  getDate() {
    return this.formatDate(new Date());
  },
  /**
   * 获取当前时间串(HH:MM:SS)
   * @returns {string}
   */
  getTime() {
    return this.formatTime(new Date());
  },
  /**
   * 获取当前时间戳
   * @returns {timestamp}
   */
  getTimestamp() {
    return new Date().getTime();
  },
  /**
   * 获得当前日期串(YYYY-MM-DD)
   * @returns {string}
   */
  getToday() {
    return this.getDate();
  },
  /**
   * 获取昨天日期串(HH:MM:SS)
   * @returns {string}
   */
  getYesterDay() {
    return this.formatDate(this.DateAdd("d", -1, new Date()));
  },
  /**
   * 时间加减函数
   * @param interval
   * @param number
   * @param date
   * @returns {date}
   */
  DateAdd(interval, number, date) {
    switch (interval.toLowerCase()) {
      case "y":
        return new Date(date.setFullYear(date.getFullYear() + number));
      case "m":
        return new Date(date.setMonth(date.getMonth() + number));
      case "d":
        return new Date(date.setDate(date.getDate() + number));
      case "w":
        return new Date(date.setDate(date.getDate() + 7 * number));
      case "h":
        return new Date(date.setHours(date.getHours() + number));
      case "n":
        return new Date(date.setMinutes(date.getMinutes() + number));
      case "s":
        return new Date(date.setSeconds(date.getSeconds() + number));
      case "l":
        return new Date(date.setMilliseconds(date.getMilliseconds() + number));
    }
  },
  /**
   * 將日期類型格式的字符串轉化為日期類型
   * @param 日期格式化
   * @returns {String}
   */
  toDate(expr) {
    if (typeof expr == 'string') {
      expr = expr.replaceAll('-', '/');//將字符中的-替換為/,原因是IE或其它瀏覽器不支持-符號的Date.parse()
      return new Date(Date.parse(expr));
    } else {
      return expr;
    }
  },
  /**
   * 获取某个月的天数
   * @param year
   * @param month
   * @returns {integer}
   */
  getDaysOfMonth: function (year, month) {
    return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  },
  /**
   * 获得本月天数
   * @returns {int}
   */
  getMonthDays(nowYear, nowMonth) {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    var monthEndDate = new Date(nowYear, nowMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  },
  /**
   * 获取上月的天数
   * @param year
   * @param month
   * @returns {integer}
   */
  getDaysOfLastMonth: function (year, month) {
    // 将天置为0，会获取其上个月的最后一天
    month = parseInt(month) + 1;
    var date = new Date(year, month, 0);
    return date.getDate();
  },
  /***
   * 已知开始时间和结束时间 计算出中间的所有日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns {array}
   */
  getAllDate(start, end) {
    let dateArr = [];
    let startArr = start.split("-");
    let endArr = end.split("-");
    let db = new Date();
    db.setUTCFullYear(startArr[0], startArr[1] - 1, startArr[2]);
    let de = new Date();
    de.setUTCFullYear(endArr[0], endArr[1] - 1, endArr[2]);
    let unixDb = db.getTime();
    let unixDe = de.getTime();
    let stamp;
    const oneDay = 24 * 60 * 60 * 1000;
    for (stamp = unixDb; stamp <= unixDe;) {
      dateArr.push(formatDate(new Date(parseInt(stamp))));
      stamp = stamp + oneDay;
    }
    return dateArr;
  },
  /**
   * 获得本周的开始时间
   * @returns {date}
   */
  getStartDayOfWeek() {
    var day = nowDayOfWeek || 7;
    return this.formatDate(
      new Date(now.getFullYear(), nowMonth, nowDay + 1 - day)
    );
  },
  /**
   * 获得本周的结束时间
   * @returns {date}
   */
  getEndDayOfWeek() {
    var day = nowDayOfWeek || 7;
    return this.formatDate(
      new Date(now.getFullYear(), nowMonth, nowDay + 7 - day)
    );
  },
  /**
   * 获得本月的开始时间
   * @returns {string}
   */
  getStartDayOfMonth() {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    return this.formatDate(monthStartDate);
  },
  /**
   * 获得本月的结束时间
   * @returns {string}
   */
  getEndDayOfMonth() {
    var monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays());
    return this.formatDate(monthEndDate);
  },
  /**
   * 获得近几个月开始日期
   * @param monthNum 月数
   * @param istheDay true/false
   * @returns {string}
   */
  getStartDayOfLastMonth(monthNum, isTheDay) {
    let year = nowYear; //获取当前日期的年份
    let month = nowMonth; //获取当前日期的月份
    let day = isTheDay && isTheDay === true ? nowDay : nowDay - 1; //获取当前日期的日
    let days = this.getMonthDays(); //获取当前日期中月的天数
    let year2 = year;
    let month2 = parseInt(month) - monthNum;
    if (month2 <= 0) {
      year2 =
        parseInt(year2) -
        parseInt(month2 / 12 == 0 ? 1 : Math.abs(parseInt(month2 / 12)) + 1);
      month2 = 12 - (Math.abs(month2) % 12);
    }
    let day2 = day;
    let days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
      day2 = days2;
    }
    if (month2 < 10) {
      month2 = "0" + month2;
    }
    let monthStartDate = new Date(year2, month2, day2);
    return this.formatDate(monthStartDate);
  },
  /**
   * 获得近几个天开始日期
   * @param day 天数
   * @returns {string}
   */
  getStartDayOfLastDay(day) {
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds); //注意，这行是关键代码
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    var monthStartDate = new Date(tYear, tMonth, tDate);
    return this.formatDate(monthStartDate);
  },
  /**
   * 计算一个日期是当年的第几天
   * @param {Object} date
   */
  dayOfTheYear: function (date) {
    var obj = new Date(date);
    var year = obj.getFullYear();
    var month = obj.getMonth(); //从0开始
    var days = obj.getDate();
    var daysArr = [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (var i = 0; i < month; i++) {
      days += daysArr[i];
    }
    return days;
  },
  /**
   * 获得时区名和值
   */
  getZoneNameValue: function (dateObj) {
    var date = new Date(dateObj);
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var arr = date.toString().match(/([A-Z]+)([-+]\d+:?\d+)/);
    var obj = {
      'name': arr[1],
      'value': arr[2]
    };
    return obj;
  },
  /*
   * 比较时间大小
   * time1>time2 return 1
   * time1
   * time1==time2 return 0
   */
  compareTime: function (time1, time2) {
    if (Date.parse(time1.replace(/-/g, "/")) > Date.parse(time2.replace(/-/g, "/"))) {
      return 1;
    } else if (Date.parse(time1.replace(/-/g, "/")) < Date.parse(time2.replace(/-/g, "/"))) {
      return -1;
    } else if (Date.parse(time1.replace(/-/g, "/")) == Date.parse(time2.replace(/-/g, "/"))) {
      return 0;
    }
  },
};

export default DateUtil;
