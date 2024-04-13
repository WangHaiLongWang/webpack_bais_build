class CopyRenameWebpackPlugin {
    constructor(options) {
        this.options = options || {}
    }
    apply(compiler) {
        const pluginName = CopyRenameWebpackPlugin.name;
        const {entry, output} = this.options;
        let fileContent = null

        compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
            const assets = compilation.getAssets();
            assets.forEach(( { name, source } ) => {
                if (entry === name) {
                    fileContent = source
                }
            })  
            output.forEach(( dir ) => {
                compilation.emitAsset(dir, fileContent)
            })
            fileContent = null
            callback()
        })
    }
}
module.exports = CopyRenameWebpackPlugin