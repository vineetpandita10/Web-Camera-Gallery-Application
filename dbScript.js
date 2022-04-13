// Database create/open ->camera
// Database objectstore ->gallery
// photo capture/video Record – gallery or bracket object store
// Format
// data={
//     mId:12919120910
//     type:"img"/"video"
//     media: actual aapla content - image-> c.toDataUrl(), video-> blob
// }

let dbAccess;
let request = indexedDB.open("Camera", 1);
let container = document.querySelector(".container");

request.addEventListener("success", function () {
  dbAccess = request.result;
});

request.addEventListener("upgradeneeded", function () {
  let db = request.result;
  db.createObjectStore("gallery", { keyPath: "mId" });
});

request.addEventListener("error", function () {
  alert("some error occured");
});

function addMedia(type, media) {
  // assumptions ki tabhi chalega jab dbAccess hoga
  let txn = dbAccess.transaction("gallery", "readwrite");
  let galleryObjectStore = txn.objectStore("gallery");
  let data = {
    mId: Date.now(),
    type,
    media,
  };
  galleryObjectStore.add(data);
}

function viewMedia() {
  let txn = dbAccess.transaction("gallery", "readonly");
  let galleryObjectStore = txn.objectStore("gallery");
  let req = galleryObjectStore.openCursor();
  req.addEventListener("success", function () {
    let cursor = req.result;

    if (cursor) {
      let div = document.createElement("div");
      div.classList.add("media-card");
      div.innerHTML = `<div class="media-container"></div>
      <div class="action-container">
        <button class="media-download">Download</button>
        <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
      </div> `;

      let downloadBtn = div.querySelector(".media-download");
      let deleteBtn = div.querySelector(".media-delete");
      deleteBtn.addEventListener("click", function (e) {
        let mId = e.currentTarget.getAttribute("data-id");
        // UI se delete krna hai
        e.currentTarget.parentElement.parentElement.remove();

        // indexedDB se bhi delete krna hai
        deleteMediaFromDB(mId);
      });

      if (cursor.value.type === "img") {
        let img = document.createElement("img");
        img.classList.add("media-gallery");
        img.src = cursor.value.media;
        let mediaContainer = div.querySelector(".media-container");
        mediaContainer.appendChild(img);

        downloadBtn.addEventListener("click", function (e) {
          let a = document.createElement("a");
          a.download = "image.jpg";
          a.href =
            e.currentTarget.parentElement.parentElement.querySelector(
              ".media-container"
            ).children[0].src;
          // or a.href = img.src
          a.click();
          a.remove();
        });
      } else {
        let video = document.createElement("video");
        video.classList.add("media-gallery");
        video.src = window.URL.createObjectURL(cursor.value.media);

        video.controls = true;
        video.loop = true;
        video.muted = true;

        video.addEventListener("mouseenter", function () {
          video.currentTime = 0;
          video.play();
        });

        video.addEventListener("mouseout", function () {
          video.pause();
        });

        let mediaContainer = div.querySelector(".media-container");
        mediaContainer.appendChild(video);

        downloadBtn.addEventListener("click", function (e) {
          let a = document.createElement("a");
          a.download = "video.mp4";
          a.href =
            e.currentTarget.parentElement.parentElement.querySelector(
              ".media-container"
            ).children[0].src;
          // or a.href = img.src
          a.click();
          a.remove();
        });
      }
      container.appendChild(div);
      cursor.continue();
    }
  });
}

function deleteMediaFromDB(mId) {
  let txn = dbAccess.transaction("gallery", "readwrite");
  let galleryObjectStore = txn.objectStore("gallery");
  galleryObjectStore.delete(Number(mId));
  // mId is a string but db mein its a number so type cast
}
