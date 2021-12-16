/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-16 16:56:56
 * @LastEditTime: 2021-12-16 20:28:28
 * @LastEditors: changqing
 * @Usage: 
 */
import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

console.log('___________________', process.env.TARGET);
// 根据环境变量中 target 属性，获取对应模块中的 package.json
if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}
const packageFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const sourcemap = process.env.SOURCE_MAP;

// 需要根据target 找到要打包的目录

// 获取packages 目录
const packagesDir = path.resolve(__dirname,'packages');
// 获取要打包的某个包 (打包的基本目录)
const packageDir = path.resolve(packagesDir,process.env.TARGET); // 要打包的入口
// 获取 对应打包目录 下的文件（这里用来取 package.json文件）
// 以打包的目录解析文件
const resolve = p => path.resolve(packageDir,p); 
// 获取package.json文件 
const pkg = require(resolve('package.json'));
// 获取 package.json文件中我们自定义的属性 buildOptions
// 稍后打包所有文件的时候 可能不会有packageFormats值
// 首先取 dev.js中环境变量 formats 否则 到package.json中取
const packageConfigs = packageFormats || pkg.buildOptions.formats;
// 我就可以取到要打包的名字了
const name = path.basename(packageDir);
// 要打包的个包的输出目录
const outputConfig = {
  'esm-bundler':{
      file:resolve(`dist/${name}.esm-bundler.js`),
      format:'es'
  },
  'cjs':{
      file:resolve(`dist/${name}.cjs.js`),
      format:'cjs'
  },
  'global':{
      file:resolve(`dist/${name}.global.js`),
      format:'iife'
  }
}
 
function createConfig(format,output){
    output.sourcemap = sourcemap; // 添加sourcemap  
    output.exports = 'named';
    let external = []; // 外部模块 哪些模块不需要打包
    if(format === 'global'){
        output.name = pkg.buildOptions.name
    }else{
        external = [...Object.keys(pkg.dependencies)]; // 如果是es6 cjs 不需要打包shared
    }
    return { // createConfig的结果就是rollup的配置
        input: resolve(`src/index.ts`),// 入口
        output,//出口 就是上面的output
        external,//排除打包的
        plugins:[
            json(),
            ts({
              tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }), // 将ts转化成js文件
            commonjs(),
            nodeResolve()
        ]
    }
}
// 返回数组 会进行依次的打包
export default packageConfigs.map(format=>createConfig(format,outputConfig[format]) )