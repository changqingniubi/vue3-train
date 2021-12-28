<!--
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-16 16:46:09
 * @LastEditTime: 2021-12-28 11:20:12
 * @LastEditors: changqing
 * @Usage: 
-->



# 仓库简介

手写是写vue3的 diff 算法

# 构建说明

当运行命令 pnpm dev 时 我们去scripts运行 dev.js (打包单个模块)
pnpm build 时我们去scripts运行 build.js（打包packages下所有模块）

## 运行dev脚本

```javascript
  pnpm dev --  -f=global  -t=reactivity
  //esm-bunlder global cjs
  pnpm dev -- -f=global

  pnpm dev -- -t=reactivity

```

## 运行build脚本

```javascript
  pnpm build
  //es
```

# 其他

1. 先比较老两个元素是否是能复用的 div -> span  删除div 直接换成span
2. 如果两个元素 类型都是div key都是undefined 说明两个元素可以复用。 需要比对两个元素的属性
3. 比较两个节点的儿子元素

