/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-18 22:01:35
 * @LastEditTime: 2021-12-18 22:01:35
 * @LastEditors: changqing
 * @Usage: 
 */
export const nodeOps = {
  insert: (child, parent, anchor = null) => { // 插入有追加的功能
      parent.insertBefore(child, anchor); // parent.appendChild(child)
  },
  remove: child => {
      const parent = child.parentNode;
      if (parent) {
          parent.removeChild(child);
      }
  },
  createElement: tag => document.createElement(tag),
  createText: text => document.createTextNode(text),
  setElementText: (el, text) => el.textContent = text,
  setText: (node, text) => node.nodeValue = text,
  parentNode: node => node.parentNode,
  nextSibling: node => node.nextSibling,
  querySelector: selector => document.querySelector(selector)
}


// runtime-dom 提供 节点操作的api -> 传递给 runtime-core 