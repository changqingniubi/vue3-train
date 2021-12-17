/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-15 17:55:45
 * @LastEditTime: 2021-12-17 14:31:35
 * @LastEditors: changqing
 * @Usage: 
 */
export function isObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null
}
export function isFunction(value):boolean{
  return typeof value === 'function'
}