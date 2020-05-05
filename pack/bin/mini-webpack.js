#!/usr/bin/env node
console.log('mini-webpack之旅开始了！')

const path = require('path')

// 1.读取打包配置文件
const config = require(path.resolve('webpack.config.js'))

// 2.通过面向对象的方式进行项目推进
const Compiler = require('../lib/Compiler')
new Compiler(config).start()