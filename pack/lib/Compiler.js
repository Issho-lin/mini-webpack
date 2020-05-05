const path = require('path')
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const genarator = require('@babel/generator').default
const ejs = require('ejs')

module.exports = class Compiler {
  constructor(config) {
    this.config = config
    this.entry = this.config.entry
    // 命令执行时所在的目录
    this.root = process.cwd()
    // 初始化一个空对象，存放所有的模块
    this.modules = {}
    // loader配置
    this.rules = config.module.rules
  }
  start() {
    // 打包逻辑
    // 1. 依赖分析
    this.depAnalyse(path.resolve(this.root, this.entry))
    // console.log(this.modules)
    this.emitFile()
  }
  depAnalyse(modulePath) {
    // 读取模块内容
    let source = this.getSource(modulePath)

    // 执行loader
    const executeLoader = (use, obj) => {
      const loader = require(path.join(this.root, use))
      source = loader.call(obj, source)
    }

    // 读取rules规则，倒序迭代，因为loader作用的优先级是倒序的
    for (let i = this.rules.length - 1; i >= 0; i--) {
      // 获取每一条规则
      const { test, use } = this.rules[i]
      // 与modulePath进行匹配
      if (test.test(modulePath)) {
        // 如果use是字符串
        if (typeof use === 'string') {
          executeLoader(use)
        }
        // 如果use是数组
        if (Array.isArray(use)) {
          for (let k = use.length - 1; k >= 0; k--) {
            executeLoader(use[k])
          }
        }
        // 如果use是对象
        if (use instanceof Object) {
          executeLoader(use.loader, { query: use.options })
        }
      }
    }

    // 准备一个依赖数组，用来存储当前模块的所有依赖
    let dependencies = []
    // 替换require
    // 通过抽象语法树找到require
    // 解析成AST抽象语法树
    const ast = parser.parse(source)
    // console.log(ast.program.body)
    // 替换抽象语法树的代码
    traverse(ast, {
      // param是抽象语法树找到的节点
      CallExpression(param) {
        const calleeName = param.node.callee.name
        if (calleeName === 'require') {
          param.node.callee.name = '__webpack_require__'
          // 修改路径
          const filePath = ('./' + path.join('src', param.node.arguments[0].value)).replace(/\\+/g, '/')
          param.node.arguments[0].value = filePath
          // 每找到一个require调用，就将其中的路径修改完毕后加入到依赖数组中
          dependencies.push(filePath)
        }
      }
    })
    // 把替换好的抽象语法树转成源码
    const sourceCode = genarator(ast).code
    // console.log(sourceCode)
    // 构建modules对象存储模块
    // 键必须为相对路径
    const relativeModulePath = ('./' + path.relative(this.root, modulePath)).replace(/\\+/g, '/')
    this.modules[relativeModulePath] = sourceCode
    // 递归加载所有依赖
    // console.log(dependencies)
    dependencies.forEach(dep => {
      this.depAnalyse(path.resolve(this.root, dep))
    })
  }
  getSource(path) {
    return fs.readFileSync(path, 'utf-8')
  }
  emitFile() {
    let template = this.getSource(path.join(__dirname, '../template/output.ejs'))
    const result = ejs.render(template, {
      entry: this.entry,
      modules: this.modules
    })
    // console.log(result)
    const dir = this.config.output.path
    const outputPath = path.join(dir, this.config.output.filename)
    // console.log(outputPath)
    fs.exists(dir, exists => {
      if (!exists) {
        fs.mkdirSync(dir)
      }
      fs.writeFileSync(outputPath, result)
    })
  }
}