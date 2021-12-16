<!--
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-16 16:46:09
 * @LastEditTime: 2021-12-16 20:33:18
 * @LastEditors: changqing
 * @Usage: 
-->

# 说明

当运行命令 pnpm dev 时 我们去scripts运行 dev.js (打包单个模块)
pnpm build 时我们去scripts运行 build.js（打包packages下所有模块）

## 运行dev脚本

```javascript
  pnpm dev --  --f=global  reactivity
  //esm-bunlder global cjs
```