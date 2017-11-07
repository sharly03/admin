import { browserHistory } from 'react-router';
import { stringify, extract, parse } from 'query-string';
import isString from 'lodash/isString';

export default browserHistory;

export function parseParam(search) {
  return parse(search);
}

export function stringifyParam(search) {
  return stringify(search);
}

export function getSearch(url) {
  return extract(url);
}

/**
 * 当前页参数改变 用这个
 * @param location
 * @param query
 * @param isReplace
 */
export function queryTo(location, query, isReplace) {
  query = Object.assign(query || {}, location.query);

  if (isReplace) {
    browserHistory.replace({ pathname: location.pathname, query });
  } else {
    browserHistory.push({ pathname: location.pathname, query });
  }
}

/**
 * 跳转至不同页面，路由改变的时候用这个
 * @param location eg. '/aaa/bbb'
 * @param isReplace
 * @param query Object eg. {page: 1, pageSize: 20}
 */
export function redirect(location, isReplace, query) {
  if (isString(location)) {
    location = { pathname: location, query: query || {} };
  } else {
    queryTo(location, query, isReplace);
  }
  if (isReplace) {
    browserHistory.replace(location);
  } else {
    browserHistory.push(location);
  }
}
