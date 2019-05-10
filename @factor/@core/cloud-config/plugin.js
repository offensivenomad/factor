const merge = require("deepmerge")
const { existsSync } = require("fs-extra")
module.exports = Factor => {
  return new (class {
    constructor() {
      this.env =
        process.env.NODE_ENV == "development" || Factor.FACTOR_CONFIG.env == "development"
          ? "development"
          : "production"

      this.initialize()
    }

    initialize() {
      let publicConfig = {}
      const configFilePath = Factor.$paths.get("config-file")

      if (existsSync(configFilePath)) {
        publicConfig = require(configFilePath)
      }

      const privateConfig = Factor.$keys.readEncrypted(this.env)

      const configObjects = [
        Factor.FACTOR_CONFIG,
        publicConfig[this.env],
        publicConfig.config,
        privateConfig[this.env],
        privateConfig.config,
        {
          env: this.env
        }
      ].filter(_ => _)

      const mergedConfig = merge.all(configObjects)

      mergedConfig.url = this.getSiteUrl(mergedConfig)

      this._settings = mergedConfig
    }

    getSiteUrl(config) {
      if (this.env == "production") {
        return config.url || config.homepage || ""
      } else {
        return Factor.$paths.localhostUrl()
      }
    }

    settings() {
      return this._settings
    }

    setting(key) {
      return this._settings[key]
    }
  })()
}