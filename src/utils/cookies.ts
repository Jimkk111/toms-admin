import Cookies from 'js-cookie';

// App
const sidebarStatusKey = 'sidebar_status';
export const getSidebarStatus = () => Cookies.get(sidebarStatusKey);
export const setSidebarStatus = (sidebarStatus: string) => Cookies.set(sidebarStatusKey, sidebarStatus);

// User
const storeId = 'storeId';
export const getStoreId = () => Cookies.get(storeId);
export const setStoreId = (id: string) => Cookies.set(storeId, id);
export const removeStoreId = () => Cookies.remove(storeId);

// JWT 登录态由后端 Set-Cookie 承载，前端不再手动存取 token

// userInfo

const userInfoKey = 'userInfo';
export const getUserInfo = () => Cookies.get(userInfoKey);
export const setUserInfo = (useInfor: Object) => Cookies.set(userInfoKey, useInfor);
export const removeUserInfo = () => Cookies.remove(userInfoKey);

// printinfo

const printKey = 'print';
export const getPrint = () => Cookies.get(printKey);
export const setPrint = (useInfor: Object) => Cookies.set(printKey, useInfor);
export const removePrint = () => Cookies.remove(printKey);

// 获取消息
const newData = 'new';
export const getNewData = () => Cookies.get(newData);
export const setNewData = (val: Object) => Cookies.set(newData, val);
