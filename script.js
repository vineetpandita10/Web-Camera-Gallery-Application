let body = document.querySelector("body");

let video = document.querySelector("video");
// let audio = document.querySelector("audio");
// humne video naam ka tag daal rakha hai html mein usme modifications krni hain

let vidBtn = document.querySelector("button#record");
// button for recording

let capBtn = document.querySelector("button#capture");
// button for capturing image

let galleryBtn = document.querySelector(".gallery");
// button for accessing the gallery

let filters = document.querySelectorAll(".filter-item");
// getting all the filters

let filter = "";
// currently selected filter, canvas isse use krega to apply the color on the clicked image

for (let f of filters) {
  f.addEventListener("click", function (e) {
    filter = e.currentTarget.style.backgroundColor;
    // filter ka color abhi vale color ko set kr rahw

    removeFilter();
    // agar pehle se koi filter applied hai toh usse remove krna padega

    addFilter(filter);
    // new color wala filter apply kr rahe hain
  });
}

galleryBtn.addEventListener("click", function () {
  location.assign("gallery.html");
});

capBtn.addEventListener("click", function () {
  // capture button ke click par yeh function call hojayega jisse hum
  // video mein presently jo bhi hoga usse capture kr lenge

  let innerDiv = capBtn.querySelector("div");
  innerDiv.classList.add("capture-animation");
  setTimeout(function () {
    innerDiv.classList.remove("capture-animation");
    // 0.5 s mein remove kr rahe taaki shutter like animation bnjaye
  }, 500);
  capture();
});

// constraints object pass krte - jisse hum mediafunctions ko btate ki humme konse vala media device chaiye
let constraints = { video: true, audio: true };
let mediaRecorder;
// it is an object of media recorder which is used to record the media stream

let isRecording = false;
// it is used to store if abhi recording chal rahi ya nahi

let chunks = [];
// an array containing all the data chunks

vidBtn.addEventListener("click", function () {
  let innerDiv = vidBtn.querySelector("div");
  // we used a button to start and stop recording
  if (isRecording) {
    mediaRecorder.stop();
    // this is an inbuilt function which triggers the stop event listener
    isRecording = false;
    // vidBtn.innerText = "Record";
    // just to keep track of the recording
    innerDiv.classList.remove("record-animation");
    // jabtk stop nahi krenge tabtk animation chlti rahegi
  } else {
    filter = "";
    removeFilter();
    // video mein filter nahi laga skte isliye humme removeFilter ko call krna padega
    // also, agar remove filter ko call nahi krenge toh next time
    // jab image click krenge toh filter vala div pehle se hi laga hua hoga
    video.style.transform = `scale(1)`;
    currZoom = 1;
    // similar to the above reason

    mediaRecorder.start();
    // this is an inbuilt function which triggers the dataavailable event listener
    isRecording = true;
    // vidBtn.innerText = "Recording.....";

    innerDiv.classList.add("record-animation");
  }
});

// navigator ek browser ka pre defined object hai - jisme pehle se ek object hai -
// media devices - jisme ek promised based function hai ( jabtk hum access allow ya deny nahi krte)
//  jiske through hum user ke media devices (camera and mic) access kr skte hai
navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
  // mediaStream hamari promise ki resolve value hai jo humme video/audio source provide krti hai
  video.srcObject = mediaStream;
  // audio.srcObject = mediaStream;
  // instead of url we are using mediaStream as the src

  mediaRecorder = new MediaRecorder(mediaStream);
  // MediaRecorder is an pre existing object available in the browser which is used to record the mediaStream

  // MediaRecorder has 2 inbuilt event listeners
  // dataavailable and stop

  mediaRecorder.addEventListener("dataavailable", function (e) {
    // this event listener is triggered as soon as we start recording
    // jaise hi the limit of storage (memory mein kahi store ho raha hoga)
    // exceeds, this event pushes the data
    // into the chunks array
    chunks.push(e.data);
  });

  mediaRecorder.addEventListener("stop", function () {
    // stop is triggered jab recording complete hojati (stop function jab call hota)

    let blob = new Blob(chunks, { type: "video/mp4" });
    // a blog is a single large RAW File in Binary form
    // we give it a type usko btane ke liye ki kis type ki file bnare

    addMedia("video", blob);
    // video ke time par blob ka pointer send krenge toh toh voh RAM se clear hojayega toh object gayab hojayega
    // isliye hum DB mein poora blob hi database copy krenge

    chunks = [];
    // chunks ko reset krdo

    // file ko download krne ke liye humme uska ek URL banalia browser par hi
    
    // file ko download krne ke liye anchor tag bnakr usko click krke remove krdia
    // let url = URL.createObjectURL(blob);
    // let a = document.createElement("a");
    // a.href = url;
    // a.download = "video.mp4";
    // a.click();
    // a.remove();
  });
});

function capture() {
  // is function mein hum media stream par presently jo bhi present hoga
  // usse canvas par load krke canvas se voh image download krenge
  let c = document.createElement("canvas");
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  // canvas ki height and width utni hi hogi jitni video jo play ho rahi
  // uski jitni height and width hai rather than jo videoPlayer hai uski

  let ctx = c.getContext("2d");

  ctx.translate(c.width / 2, c.height / 2);
  // canvas ke andr vale content ko scale kr rahe hain
  // canvas hmesha origin se scale krta hai but humme center point
  // se scale krna hai isliliye canvas ko origin ko center par laakr scale kiya
  // uske baad vapas origin ko piche legye

  ctx.scale(currZoom, currZoom);
  ctx.translate(-c.width / 2, -c.height / 2);

  ctx.drawImage(video, 0, 0);
  // draw image mein hum video bhi pass kr skte hain

  if (filter != "") {
    ctx.fillStyle = filter;
    ctx.fillRect(0, 0, c.width, c.height);
    // agar filter applied hai toh  canvas par voh filter ka color lagado
    // and since opacity low hai toh filter like show hojayega
  }

  addMedia("img", c.toDataURL());
  // image ke url mein purri image ka hi hexa decimal chala jaata hai jisse decode krke hum imaage le skte
  
  // let a = document.createElement("a");
  // a.download = "image.jpeg";
  // a.href = c.toDataURL();
  // yaha par blob jaisa kuch nahi hai toh sidha hi canvas ka jo content hai usse use krte for download
  // using the function toDataURL jo as an image canvas ka data return kr rahi
  // a.click();
  // a.remove();
}

function removeFilter() {
  let filterDiv = document.querySelector(".filter-div");
  if (filterDiv) {
    filterDiv.remove();
  }
}

function addFilter(filterColor) {
  let filterDiv = document.createElement("div");
  // ek div bnate hai full size ka and usme background color set kr dete hain
  filterDiv.classList.add("filter-div");
  // isme saari properties hain jo new div ke pass honi chaiye
  filterDiv.style.backgroundColor = filterColor;
  // background color mein abhi vala color lagadia
  body.appendChild(filterDiv);
  // body par attack krdia jisse poora filter type effect aajaye
}

let currZoom = 1;
// abhi kitna zoom ho rakha hai
let minZoom = 1;
// isse km zoom nahi ho skta
let maxZoom = 3;
// isse zyada zoom nahi ho skta

let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");

zoomIn.addEventListener("click", function (e) {
  if (currZoom + 0.1 > maxZoom) {
    return;
  } else {
    currZoom += 0.1;
    video.style.transform = `scale(${currZoom})`;
  }
});

zoomOut.addEventListener("click", function (e) {
  if (currZoom - 0.1 < minZoom) {
    return;
  } else {
    currZoom -= 0.1;
    video.style.transform = `scale(${currZoom})`;
  }
});
