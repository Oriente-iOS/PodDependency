const http = require('http')

http
  .createServer((req, res) => {
    if (req.url === '/upload') {
      let chunks = []
      req.on('data', chunk => {
        chunks.push(chunk)
      })
      req.on('end', () => {
        let str = chunks.toString()
        let file = ''
        console.log(req.method.toLowerCase())
        if (req.method.toLowerCase() === 'post') {
          console.log(str)
          let regex = /Content-Type.*\r\n/
          let ret = regex.exec(str)
          // console.log(str.match(i))
          file = str.match(/Content-Type.*\n((.|\n)*)\n.*WebKit/i)[1]
        }

        // console.log(file)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader(
          'Access-Control-Allow-Methods',
          'PUT,POST,GET,DELETE,OPTIONS'
        )
        res.setHeader('Content-Type', 'application/json;charset=utf-8')
        res.end(file)
      })
    }
  })
  .listen(8088)
console.log('serve start at part :8088')
