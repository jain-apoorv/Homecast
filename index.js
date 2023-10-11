const fs = require("fs");
const express = require("express");
const app = express();
const ffmpeg = require('ffmpeg');

//to access form input in res
const bp = require('body-parser');
const { dirname } = require("path");
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
//

let directory = "D:/Homecast/just_for_checking";

let fileInsideDirectory = fs.readdirSync(directory);

let fileNumbers = fileInsideDirectory.length;
// console.log(fileNumbers);

const videosContainer = fs.readFileSync(`${__dirname}/videoContainerTemp.html`, "utf-8");

const video_temp = fs.readFileSync(`${__dirname}/videoCardTemp.html`, "utf-8");
const main = fs.readFileSync(`${__dirname}/homecastMain.html`, 'utf-8');

let initial = main.replace(/{%VIDEOS%}/, "");
fs.writeFileSync(`${__dirname}/filledHomecastMain.html`, initial);
// console.log(fileInsideDirectory[0]);

app.get("/", (req, res)=>{
  // res.
  res.sendFile(`${__dirname}/filledHomEcastMain.html`);
})


app.get("/new", (req, res) => {
  // changing src and queueing videos
let dataa = "";
for (i = 0; i < fileNumbers; i++) {
  const x = video_temp.replace(/{%VIDEO_LINK%}/, "/video" + i);
  dataa += x;
}

//adding those videos into a container
let dataa2 = videosContainer.replace(/{%VIDEOS%}/g, dataa);
//adding that container to main file
let dataa3 = main.replace(/{%VIDEOS%}/g, dataa2);
// console.log(dataa2);

fs.writeFileSync(`${__dirname}/filledHomecastMain.html`, dataa3);
  res.sendFile(`${__dirname}/filledHomecastMain.html`);
});



app.post('/enterFolder', (req, res)=>{
  
  console.log(req.body);
  let x = req.body;
  // console.log(x.folder);
  let y = x.folder;
  console.log(y);
  directory = y.replace(/\\/g, '/');
  // directory = y.replace(/\/g, "/");
   
  console.log(directory);
  
  fileInsideDirectory = fs.readdirSync(directory);
  fileNumbers = fileInsideDirectory.length;

  // return res.redirect('/');
  
  
  
   return res.redirect('/new');
})






for (let i = 0; i < fileNumbers; i++) {
  
  app.get(`/video${i}`, (req, res) => {
    // const k = Number(req.path.replace(/\D/g, ""));
    const range = req.headers.range; // client mujhe range do
    // clinet "range" : "bytes: 23654-">>23654 se end tak dedo
    if (!range) {
      res.status(400).send("requires range header");
    }

    const videoPath = directory + "/" + fileInsideDirectory[i];

    const videoSize = fs.statSync(videoPath).size;

    const chunk_size = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunk_size, videoSize - 1);

    const contentLength = start - end + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
  });
}
console.log("file number is"+ fileNumbers);

app.get("/new", (req, res)=>{
    res.sendFile(`${__dirname}/checking.html`);
})




app.listen(4000, () => {
  console.log("listening");
});