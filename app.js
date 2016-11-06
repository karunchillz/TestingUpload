var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

http.createServer(function (req, res) {
  console.log('req.url',req.url);
  var videoName = 'Nike.mpg';

  console.log('videoName',videoName);

  var file = path.resolve(__dirname,videoName);

  fs.stat(file, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 Error if file not found
        return res.writeHead(404, { "Content-Type": "text/html" });
      }
    res.end(err);
    }
    var range = req.headers.range;
    if (!range) {
     // 416 Wrong range
     return res.writeHead(416, { "Content-Type": "text/html" });
    }
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      }).on("error", function(err) {
        res.end(err);
      });
  });


}).listen(process.env.PORT||8888);