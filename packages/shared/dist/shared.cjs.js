'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-15 17:55:45
 * @LastEditTime: 2021-12-20 10:57:00
 * @LastEditors: changqing
 * @Usage:
 */
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (value, key) => hasOwnProperty.call(value, key);
/*
let r = ShapeFlags.ELEMENT | ShapeFlags.FUNCTIONAL_COMPONENT; // r包含元素和函数式组件
// 我们像看r 是不是元素
(r & ShapeFlags.ELEMENT) > 0; // 说明包含元素
(r & ShapeFlags.FUNCTIONAL_COMPONENT) > 0
*/
// 二进制  00000100  位移  | & 是做权限必备的一个操作 
// | 来组合权限 & 来判断是否包含某个权限
//   001 |  010 => 011  =3    011 & 001 = 001   011 & 010 => 010   011 & 100  -> 000
// 001
// 010
// 100

exports.hasOwn = hasOwn;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isString = isString;
