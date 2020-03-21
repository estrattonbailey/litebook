const fs = require("fs-extra");
const path = require("path");

function getFileImportsFromStats(stats) {
  let imports = "";

  for (let stat of stats) {
    if (stat.errors.length) continue;
    const asset = stat.assets[0];
    const filename = asset.name;
    const filepath = path.join(asset.outputPath, filename);
    const basename = filename.replace(/\.\w+$/, "");
    imports += `import ${basename} from '${filepath}';\n`;
  }

  return imports;
}

function createApp(stats, {
  cwd,
  tempDir,
}) {
  const imports = getFileImportsFromStats(stats);
  const index = stats.map(stat => {
    const asset = stat.assets[0];
    const relPath = asset.outputPath.replace(tempDir, "");
    const filepath = path.join(relPath, asset.name).replace(/^\//, "");
    return {
      id: filepath,
      name: asset.name,
      errors: stat.errors,
      warnings: stat.warnings,
      component: asset.name.replace(/\.\w+$/, "")
    };
  });
  const theme = path.resolve(cwd, "./theme/dist/theme.es.js");

  const script = `
    import React from 'react';
    import { Theme } from '${theme}';
    ${imports}

    const index = [
      ${index.map(idx => (
        `{
          id: '${idx.id}',
          name: '${idx.name}',
          errors: ${JSON.stringify(idx.errors)},
          warnings: ${JSON.stringify(idx.warnings)},
          component: ${idx.errors.length ? null : idx.component},
        }`
      )).join(",")}
    ]

    export default () => {
      return <Theme index={index} />;
    }
  `;

  fs.writeFileSync(path.join(tempDir, "App.js"), script);
}

function createIndex(stats, {
  tempDir,
  watch
}) {
  const hot = `if (module.hot) module.hot.accept();`;

  const script = `
    import React from 'react';
    import { render } from 'react-dom';
    import App from './App.js';

    render(<App />, document.getElementById('root'));

    ${watch ? hot : ``}
  `;

  fs.writeFileSync(path.join(tempDir, "index.js"), script);
}

module.exports = {
  createApp,
  createIndex,
}
