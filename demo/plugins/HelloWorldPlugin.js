// 1.构造函数
// 2.prototype中需要有一个apply方法
module.exports = class HelloWorldPlugin {
  apply(compiler) {
    // 通过compiler对象可以注册对应的事件
    compiler.hooks.done.tap('HelloWorldPlugin', stats => {
      console.log('webpack打包结束')
      // console.log(stats)
    })
    compiler.hooks.emit.tap('HelloWorldPlugin', compilation => {
      console.log('文件发射结束')
      // console.log(compilation)
    })
  }
}