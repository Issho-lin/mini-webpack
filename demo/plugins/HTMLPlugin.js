const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
module.exports = class HTMLPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    const outputDir = compiler.options.output.path
    // 1.注册afterEmit钩子
    compiler.hooks.afterEmit.tap('HTMLPlugin', compilation => {
      // 2.根据创建对象时传入的template属性来读取html模板
      // console.log(this.options)
      let res = fs.readFileSync(this.options.template, 'utf-8')
      // console.log(res)
      // 3.使用cheerio分析html，可以直接使用jQuery的api
      const $ = cheerio.load(res)
      Object.keys(compilation.assets).forEach(item => {
        $(`<script src='/${item}'></script>`).appendTo('body')
      })
      // console.log($.html())
      // 4.根据传入的filename输出新生成的html字符串
      const outputPath = path.join(outputDir, this.options.filename)
      fs.writeFileSync(outputPath, $.html())
    })
  }
}