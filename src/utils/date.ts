import dayjs from 'dayjs'

// dayjs日期处理库
// dayjs()获取当前时间

const DATE = 'YYYY-MM-DD'

/** 昨日、今日（展示用 yyyy.mm.dd） */
export const getday = (): [string, string] => [
  dayjs().subtract(1, 'day').format('YYYY.MM.DD'),
  dayjs().format('YYYY.MM.DD'),
]

/** 昨日 */
export const get1stAndToday = (): [string, string] => [
  dayjs().subtract(1, 'day').format(DATE),
  dayjs().subtract(1, 'day').format(DATE),
]

/** 近7日（含今日） */
export const past7Day = (): [string, string] => [
  dayjs().subtract(7, 'day').format(DATE),
  dayjs().format(DATE),
]

/** 近30日（含今日） */
export const past30Day = (): [string, string] => [
  dayjs().subtract(30, 'day').format(DATE),
  dayjs().format(DATE),
]

/** 本周（周一开始） */
export const pastWeek = (): [string, string] => {
  const dow = (dayjs().day() + 6) % 7
  return [dayjs().subtract(dow, 'day').format(DATE), dayjs().format(DATE)]
}

/** 本月 */
export const pastMonth = (): [string, string] => [
  dayjs().startOf('month').format(DATE),
  dayjs().endOf('month').format(DATE),
]
