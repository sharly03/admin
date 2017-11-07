import axios from 'axios';
import qs from 'qs';
import jsonp from 'jsonp';
import cloneDeep from 'lodash/cloneDeep';
import pathToRegexp from 'path-to-regexp';
import { message } from 'antd';
import { redirect } from './location-helper';
import { AUTH_TOKEN_KEY } from '../utils/constants';
import { api } from '../dao/api';


const saveToken = (token) => {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const getToken = () => {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const setAuthorization = (token) => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}` || '';
};

const fetch = (options) => {
  let {
    method = 'get',
    data,
    fetchType,
    url,
  } = options;

  const cloneData = cloneDeep(data);

  try {
    let domin = '';
    if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
      domin = url.match(/[a-zA-z]+:\/\/[^/]*/)[0];
      url = url.slice(domin.length);
    }
    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);
    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name];
      }
    }
    url = domin + url;
  } catch (e) {
    message.error(e.message);
  }

  if (fetchType === 'JSONP') {
    return new Promise((resolve, reject) => {
      jsonp(url, {
        param: `${qs.stringify(data)}&callback`,
        name: `jsonp_${new Date().getTime()}`,
        timeout: 4000,
      }, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve({ statusText: 'OK', status: 200, data: result });
      });
    });
  }

  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: cloneData,
      });
    case 'delete':
      return axios.delete(url, {
        data: cloneData,
      });
    case 'post':
      return axios.post(url, cloneData); // 使用form-data的方式
    case 'put':
      return axios.put(url, cloneData);
    case 'patch':
      return axios.patch(url, cloneData);
    default:
      return axios(options);
  }
};

const refreshToken = () => {
  let oldToken = getToken();
  return fetch({
    url: api.refreshToken,
    method: 'post',
    data: {
      token: oldToken,
    },
  }).then((response) => {
    let data = response.data;
    if (data && data.code === 0) { // 刷新token成功
      saveToken(data.refresh_token);
      setAuthorization(data.refresh_token);
    } else {
      return Promise.reject(1); // 其他异常继续抛出
    }
  }).finally(() => {

  });
};

export default function request(options) {
  if (options.url && options.url.indexOf('//') > -1) {
    const origin = `${options.url.split('//')[0]}//${options.url.split('//')[1].split('/')[0]}`;
    if (window.location.origin !== origin) {
      options.fetchType = options.fetchType || 'CORS';
    }
  }
  console.log(options);
  setAuthorization(getToken());
  return fetch(options).then((response) => {
    const data = response.data;

    if (data.code === 100011) {
      // 用户未登录
      redirect('/login', true);
    }
    if (data.code === 100007) {
      refreshToken();
    }
    return data;
  }).catch((error) => {
    console.log(error);
    const { response } = error;
    let otherData = {};
    if (response) {
      const { data } = response;
      otherData = data;
    } else {
      otherData = {
        code: 600,
        msg: '网络出现异常，请稍后再试',
      };
    }
    return otherData;
  });
}

export const upload = (options) => {
  const instance = axios.create();
  instance.defaults.withCredentials = false;
  const formData = new FormData();
  formData.append('token', options.data.token);
  formData.append('file', options.data.file);
  return instance.post(options.url, formData, {
    // withCredentials: false,
    headers: {
      'Content-Type': 'multiple/form-data',
    },
  }).then((response) => response.data);
};
