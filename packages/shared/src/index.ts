/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-15 17:55:45
 * @LastEditTime: 2021-12-15 17:55:48
 * @LastEditors: changqing
 * @Usage: 
 */
export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === 'object' && value !== null
}