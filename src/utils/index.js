import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import map from 'lodash/map';
import { Select, Radio } from 'antd';
import { parse } from 'query-string';
import { IMG_HOST } from './constants';

const { Option } = Select;

// 连字符转驼峰
String.prototype.hyphenToHump = function () {
  return this.replace(/-(\w)/g, (...args) => args[1].toUpperCase());
};

// 驼峰转连字符
String.prototype.humpToHyphen = function () {
  return this.replace(/([A-Z])/g, '-$1').toLowerCase();
};

// 日期格式化
Date.prototype.format = function (format) {
  const o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds(),
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(`${o[k]}`.length));
    }
  }
  return format;
};


/**
 * @param   {String}  name
 * @return  {String}
 */

export const queryURL = (name) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
};

/**
 * 数组内查询
 * @param   {array}      array
 * @param   {String}    key
 * @param   {String}    keyAlias
 * @return  {Array}
 */
export const queryArray = (array, key, keyAlias = 'key') => {
  if (!(array instanceof Array)) {
    return null;
  }
  const item = array.filter(_ => _[keyAlias] === key);
  if (item.length) {
    return item[0];
  }
  return null;
};

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
export const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children') => {
  const data = cloneDeep(array);
  const result = [];
  const hash = {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });

  data.forEach((item) => {
    const hashVP = hash[item[pid]];
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = []);
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

export const getPictrueUrl = (uuid) =>
  IMG_HOST + uuid // 这里可以通过7牛API约束图片大小
;


export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 格式化金额（默认保留两位小数）
 * @param num String或Number类型
 * @returns {String}
 */
export const formatDecimal = (num, n = 2) => {
  // 默认返回 0.00
  if (isNaN(num) || +num === 0) return '0.00';
  return parseFloat(num).toFixed(n);
};

export const formatDecimal2 = (...args) => formatDecimal(...args);

// 时间戳 --->>> 字符串
export const dateFormat = timestamp => moment(timestamp, 'x').format('YYYY-MM-DD');
export const datetimeFormat = timestamp => moment(timestamp, 'x').format('YYYY-MM-DD HH:mm:ss');

// 时间范围转换，常用于初始化DatePicker
export const dateAreaToMoment = (timestamp1, timestamp2) => {
  const dataArea = [];
  if (timestamp1 && timestamp2) {
    dataArea.push(moment(timestamp1, 'x'));
    dataArea.push(moment(timestamp2, 'x'));
  }
  return dataArea;
};

// 浮动窗口需要指定该id作为浮动容器层，避免滚动时的错误问题
export const getPopupContainer = () => document.getElementById('dashboard_main_wrap');

// 将枚举值转换成Option项
export const mapObjectToOptions = (enumType) => {
  return map(enumType, (item, index) => <Option key={index}>{item}</Option>);
};

// 将枚举值转换成Radio项
export const mapObjectToRadios = (enumType) => {
  return map(enumType, (item, index) => <Radio value={index}>{item}</Radio>);
};

export const getId = (name = 'id') => {
  const query = parse(location.search);
  if (query[name]) {
    return query[name];
  }
};

/**
 * 获取URL参数
 * @param name
 * @return String | Object
 */
export const getParam = (name) => {
  const query = parse(location.search);
  if (name) {
    return query[name];
  }
  return query;
};
