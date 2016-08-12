const InputBlock = require('../inputBlock')
const freshRequire = require('../../lib/freshRequire')

const path = require('path')

class RootScript extends InputBlock {
  constructor (data) {
    super(data)
    try {
      const plugin = freshRequire(path.join(data.cwd, data.script))
      const electron = require('electron')
      this.script = plugin({
        console: this.logger,
        cwd: data.cwd,
        clipboard: electron.clipboard,
        nativeImage: electron.nativeImage,
      })
    } catch (e) {
      this.script = false
      this.loadError = e
    }
  }

  respondsTo (input) {
    if (!this.script) {
      this.logger.error('Plugin failed to load', {
        message: this.loadError.message,
        stack: this.loadError.stack.split('\n'),
      })
      return false
    }
    const respondsTo = this.script.respondsTo(input)
    this.logger.log('Responds to input', { input, respondsTo })
    return respondsTo
  }

  query (input) {
    return input
  }

  search (input, env = {}) {
    const query = this.query(input)
    this.logger.info('Executing Script', { query })
    return this.script.search(query, env).then((results) => {
      this.logger.log('Script Results', { results })
      return results
    }).catch((error) => {
      this.logger.error('Script failed', { query, error })
    })
  }
}

module.exports = RootScript
