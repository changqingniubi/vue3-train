/*
 * @Description: 
 * @Author: changqing
 * @Date: 2021-12-28 16:21:53
 * @LastEditTime: 2021-12-28 17:54:54
 * @LastEditors: changqing
 * @Usage: 
 */
//let reg = /\s*\$(\d+)/ig;
let reg = /\s*\$(\d+)(.*?)[\\\{\^]+/ig;


let str1="哈哈$1哈"


let str2='$3a^{4} $啊哈哈哈$3';

let str3='哈$a^{12}$哈哈$3a^{4}$嘿嘿$4么么';
let str4='$4$';

function replace$(str){
  let reg = /^\s*(\d+)/ig;
  let reg2 = /(\$)/ig;
  let arr = str.split('$');//按$ 划分内容
  let arr2=[];//存储第几个$ 需要替换为美元符号
  arr.forEach((item,index) => {
    console.log('index',index)
    console.log('item',item)
    if(reg.test(item)){ // 说明$ 后面跟数字了
        if(!/^\s*[\d](.*?)[\\\{\^]+/.test(item)){ // 不是公式
          arr2.push(index)
        }
    }
  });
  console.log('arr2',arr2)
  let count=0;
  let res = str.replace(reg2,function(rs,$1){
    console.log(rs,$1);
    count++
    console.log('count',count)
    console.log('includes',arr2.includes(count))
    if(arr2.includes(count)){
      return '＄'
    }
    return rs
  })
  return res;
}

console.log(replace$(str4));
