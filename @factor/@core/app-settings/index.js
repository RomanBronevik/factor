const merge = require("deepmerge")

export default Factor => {
  return new (class {
    constructor() {
      this.appSettings = {}
      this.setup()
    }

    getSet(directory) {
      let request

      // Webpack's require.context is used here because webpack doesn't allow for
      // variable in the require path and finding/merging these is difficult
      // Another approach would be to use node and find the appropriate files and generate a loader file
      if (directory == "theme") {
        request = require.context("@theme", false, /settings\.js/)
      } else {
        request = require.context("@", false, /settings\.js/)
      }

      const valArray = request
        .keys()
        .map(request)
        .map(_ => _.default)

      return valArray[0]
    }

    async setup() {
      const merged = [{}]
      if (Factor.FACTOR_TARGET == "app") {
        const themeSettings = this.getSet("theme")
        merged.push(themeSettings)

        const sourceSettings = this.getSet("@")
        merged.push(sourceSettings)

        this.appSettings = merge.all(merged.filter(_ => _), {
          arrayMerge: (destinationArray, sourceArray, options) => sourceArray
        })
      }
    }

    get(name) {
      const k = name.split(".")

      let setting = null

      k.forEach((_, index) => {
        if (setting && setting[_]) {
          setting = setting[_]
        } else if (this.appSettings[_]) {
          setting = this.appSettings[_]
        }
      })

      return setting
    }
  })()
}
