module.exports = function html ({
  staticHost,
  title
}) {
  staticHost = staticHost || ''
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
      <link rel="shortcut icon" type="image/x-icon" href="${staticHost}assets/favicon.ico" />
      <link href="${staticHost}assets/index.css" rel="stylesheet">

      <title>${title}</title>
    </head>
    <body>
      <div id="root"></div>
      <script src="${staticHost}assets/index.js"></script>
    </body>
  </html>
  `
}
