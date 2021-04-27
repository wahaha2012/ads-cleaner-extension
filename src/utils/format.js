/**
 * format number unit
 * @param {Number} num
 * @returns result formatted
 */
export const numberUnitFormat = (num) => {
  if (!Number(num)) {
    return num;
  } else if (num > 100000000) {
    return (num / 100000000).toFixed(2) + "亿";
  } else if (num > 10000) {
    return (num / 10000).toFixed(2) + "万";
  }
};

/**
 * format time diff
 * @param {String | Number | Date} time
 * @returns {String} time diff formatted string
 */
export const formatTimeDiff = (time) => {
  const timeStamp = new Date(time).getTime();
  if (!timeStamp) {
    return "";
  }

  const diff = (Date.now() - timeStamp) / 1000;
  if (diff < 60) {
    return Math.round(diff) + "秒前";
  } else if (diff >= 60 && diff < 3600) {
    return Math.floor(diff / 60) + "分钟前";
  } else if (diff >= 3600 && diff < 3600 * 24) {
    return Math.floor(diff / 3600) + "小时前";
  } else {
    return Math.floor(diff / (3600 * 24)) + "天前";
  }
};

/**
 * get number sign
 * @param {Number | String} num
 * @returns String | Number
 */
export const getSign = (num) => {
  return Number(num) > 0 ? `+${num}` : num;
};

/**
 *
 * @param {Number | String} num
 * @returns number sign color
 */
export const getSignColor = (num) => {
  const n = Number(num);

  if (n > 0) {
    return "color-red";
  } else if (n < 0) {
    return "color-green";
  } else {
    return "color-gray";
  }
};
