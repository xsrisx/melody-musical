let currentsong = new Audio();
let songs;
let currfolder;

function secondstominutesseconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingseconds = Math.floor(seconds % 60);

  const formattedminutes = String(minutes).padStart(2, "0");
  const formattedseconds = String(remainingseconds).padStart(2, "0");

  return `${formattedminutes}:${formattedseconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(
    `http://127.0.0.1:5500/web%20dev/spotify%20clone/${folder}/`
  );
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //play first song
  

  // show all songs in playlist
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li><img class="invert" src="music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>harry</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="play.svg" class="invert" alt="" />
                </div> </li>`;
  }
  //attach event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
    return songs;
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/web dev/spotify clone/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:5500/web%20dev/spotify%20clone/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < Array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // get meta data of folder
      let a = await fetch(`http://127.0.0.1:5500/web%20dev/spotify%20clone/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div  class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                >
                  <circle cx="12" cy="12" r="10" fill="#22c55e" />
                  <path d="M9.5 7.5v9l7-4.5z" fill="#000000" />
                </svg>
              </div>
              <img src="/web%20dev/spotify%20clone/songs/${folder}/cover.jpg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("fetching songs");
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
    });
  });
}

async function main() {
  // get list of all songs
  await getsongs("songs/ncs");
  playmusic(songs[0], true);

  //display all the albums on the page
  displayalbums();

  //attcah an event listener to play next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  //listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondstominutesseconds(
      currentsong.currentTime
    )} / ${secondstominutesseconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //add an eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  //add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //add event lsitener to previous and next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src= e.target.src.replace("volume.svg", "mute.svg") ;
      currentsong.volume = 0;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=0
    } else {
      e.target.src= e.target.src.replace =("mute.svg", "volume.svg");
      currentsong.volume = 0.1;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=10
    }
  });
}

main();
