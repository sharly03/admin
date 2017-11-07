// 官网地址
export const OW_URL = process.env.PUBLISH_ENV === 'production' ? 'https://www.xinlebao.com' : 'http://ow.xinlebao.com';

// 活动地址
export const activityURL = process.env.PUBLISH_ENV === 'production' ? 'https://activity.xinlebao.com/#' : 'http://ow-activity.xinlebao.com/#';

// 七牛上传地址
export const UPLOAD_URL = window.location.protocol === 'https:' ? 'https://up-z2.qbox.me' : 'http://up-z2.qiniu.com';

// 七牛图片地址
export const IMG_HOST = process.env.PUBLISH_ENV === 'production' ? 'https://image.xinlebao.com/' : 'http://oqg6k2vup.bkt.clouddn.com/';

export const AUTH_TOKEN_KEY = 'xlb_token';
export const USER_INFO_KEY = 'xlb_manage_info';
export const IMG_TOKEN_KEY = 'img_token';

export const APP_TIPS = 'APP_TIPS'; // 小贴士类型

