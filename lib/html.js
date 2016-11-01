module.exports = function html ({
  title
}) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
      <link href="assets/index.css" rel="stylesheet">

      <title>${title}</title>
    </head>
    <body>
      <div id="root"></div>
      <script src="assets/index.js"></script>
    </body>
  </html>
  `
}