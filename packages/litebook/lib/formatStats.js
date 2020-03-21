module.exports = function formatStats (stats) {
  return [].concat(stats.stats || stats).map(stat => {
    const { startTime, endTime } = stat
    const json = stat.toJson({
      children: false,
      modules: false
    })

    return {
      hash: Object.keys(json.entrypoints).join(':'),
      duration: (endTime - startTime) / 1000,
      warnings: json.warnings || [],
      errors: json.errors || [],
      assets: json.assets.map(({ name, size, ...rest }) => {
        return {
          name,
          size: size / 1000,
          outputPath: json.outputPath,
        }
      })
    }
  })
}
