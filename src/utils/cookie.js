/**
 * Cookie
 */

const ROOT_DOMAIN = location.hostname;

export default {
  /**
   * 获取cookie信息
   * @param {String} name 获取的cookie的键值
   * @return {String} 获取的cookie值
   */
  get(name) {
    const re = new RegExp(`(?:^|;+|\\s+)${name}=([^;]*)`);
    const result = document.cookie.match(re);

    return result ? result[1] : '';
  },
  /**
   * 设置cookie信息
   *
   * @method $.setCookie
   * @param {String} name 设置cookie的键值
   * @param {String} value 设置的cookie的值
   * @param {String} [domain:根域] 设置cookie的域名，默认根域
   * @param {String} [path:/] cookie存放的路径
   * @param {Number} [minute] 设置的cookie的有效期(分钟)
   */
  set(name, value, domain, path, minute) {
    const now = new Date();
    const expire = new Date();
    if (minute) {
      expire.setTime(parseFloat(+now) + 60 * 1000 * minute);
    }

    document.cookie = `${name}=${value}; ${minute ? (`expires=${expire.toUTCString()}; `) : ''}path=${path || '/'}; domain=${domain || ROOT_DOMAIN};`;
  },
  /**
   * 删除cookie信息
   * @param {String} name 被删除cookie的键值
   * @param {String} [domain:根域] 被删除cookie所在的域名
   * @param {String} [path:/] 被删除cookie存放的路径
   */
  del(name, domain, path) {
    document.cookie = `${name}=; expires=Mon, 2 Mar 2009 19:00:00 UTC; path=${path || '/'}; domain=${domain || ROOT_DOMAIN};`;
  },
};
