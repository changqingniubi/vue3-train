/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-16 16:04:23
 * @LastEditTime: 2021-12-16 19:48:45
 * @LastEditors: changqing
 * @Usage: 
 */
const minimist = require('minimist');
const execa = require('execa');// 开启子进程 打包， 最终还是rollup来打包的
// 获取 pnpm dev -- --t=xxx 比如 pnpm dev -- --t=reactivity 可以 执行 reactivity打包
const args = minimist(process.argv.slice(2))
console.log('args',args);
// 获取执行命令时 打包的参数
const target = args.t || 'reactivity'
const formats = args.f; // esm-bunlder global cjs
const sourcemap = args.s ==true?true:false;


// 第一参数 是命令
// 第二个参数 是rollup 运行时的执行的参数  
//          -wc 采用配置文件 
//          --environment 设置环境变量 
//          `TARGET:${target}` 环境变量 里面设置的对象。在rollup 配置文件执行时，可以获取到
//          `FORMATS:${formats}` 环境变量 里面设置的对象
//          SOURCE_MAP 是否生成 sourceMap文件
// 第三个参数 execa 执行的参数  stdio: 'inherit' 子进程打包的信息 共享给父进程
execa('rollup', [
  '-wc', // --watch --config
  '--environment', 
  [
      `TARGET:${target}`,
      formats?`FORMATS:${formats}`:``,
      sourcemap ? `SOURCE_MAP:true` : ``
  ].filter(Boolean).join(',')
],{
  stdio:'inherit', // 这个子进程的输出是在我们当前命令行中输出的
})


// pnpm run dev ->node dev.js
// dev.js -> rolliup打包 -> rollup.config.js