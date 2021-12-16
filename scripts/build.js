/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-16 20:39:43
 * @LastEditTime: 2021-12-16 20:54:57
 * @LastEditors: changqing
 * @Usage: 
 */
// 打包 packages 下所有包

const fs = require('fs')
const execa = require('execa')// 开启子进程 打包， 最终还是rollup来打包的
const minimist = require('minimist');

const args = minimist(process.argv.slice(2))
console.log('args',args);

const formats = args.f; // esm-bunlder global cjs
const sourcemap = args.s ==true?true:false;

//  读取packages文件夹下所有文件， 并且过滤 
const targets = fs.readdirSync('packages').filter(f => fs.statSync(`packages/${f}`).isDirectory())
/**
 * 对目标进行依次打包，并且是并行打包
 * */
// 打包
async function build(target) {
  console.log('target', target);
  // 第一参数 是命令
  // 第二个参数 是rollup 运行时的执行的参数  
  //          -wc 采用配置文件 
  //          --environment 设置环境变量 
  //          `TARGET:${target}` 环境变量 里面设置的对象。在rollup 配置文件执行时，可以获取到
  //          `FORMATS:${formats}` 环境变量 里面设置的对象
  //          SOURCE_MAP 是否生成 sourceMap文件
  // 第三个参数 execa 执行的参数  stdio: 'inherit' 子进程打包的信息 共享给父进程
  await execa('rollup', [
    '-c', // --watch --config
    '--environment', 
    [
        `TARGET:${target}`,
        formats?`FORMATS:${formats}`:``,
        sourcemap ? `SOURCE_MAP:true` : ``
    ].filter(Boolean).join(',')
  ],{
    stdio:'inherit', // 这个子进程的输出是在我们当前命令行中输出的
  })
}

// 循环目标 依次打包
function runParallel(targets, iteratorFn) {
  const res = [] // 保存打包结果
  // 遍历
  for (const item of targets) {
    // 依次执行
    const p = build(item)
    res.push(p)
  }
  return Promise.all(res)
}
// 执行 
runParallel(targets, build)