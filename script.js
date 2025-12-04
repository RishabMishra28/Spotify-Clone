
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
     if (isNaN(seconds) || seconds < 0) {
          return "00:00";
     }

     const minutes = Math.floor(seconds / 60);
     const remainingSeconds = Math.floor(seconds % 60);

     const formattedMinutes = String(minutes).padStart(2, '0');
     const formattedSeconds = String(remainingSeconds).padStart(2, '0');

     return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text(); 

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    // Now render songs...
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach listeners
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}



     //attach an event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
          e.addEventListener("click", element => {
               console.log(e.querySelector(".info").firstElementChild.innerHTML)
               playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
          })
     })

const playMusic = (track, pause = false) => {
     //let audio=new Audio("songs/" +track)
     currentSong.src = `${currFolder}/` + track
     if (!pause) {
          currentSong.play()
          play.src = "pause.svg"
     }
     document.querySelector(".songinfo").innerHTML = decodeURI(track)
     document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


async function displayAlbums() {
     let a = await fetch("./songs/");
     let response = await a.text();
     let div = document.createElement("div")
     div.innerHTML = response;
     let anchors = div.getElementsByTagName("a")
     let cardContainer = document.querySelector(".cardContainer")
     let array = Array.from(anchors)

     for (let index = 0; index < array.length; index++) {
          const e = array[index];

          if (e.href.includes("/songs/")) {
               let parts = e.href.split("/").filter(Boolean);
               let folder = parts.pop();
               if (folder === "songs") continue; // skip parent

               //get the metadata of all the folder
              let a = await fetch(`./songs/${folder}/info.json`);
               let response = await a.json();
               cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
               <div class="play">
      <svg role="img" aria-label="Play" viewBox="0 0 64 64" width="64" height="64"
          xmlns="http://www.w3.org/2000/svg">
        <title>Play</title>
        <circle cx="32" cy="32" r="30" fill="#1DB954" />
        <polygon points="26,20 26,44 46,32" fill="#FFFFFF" />
      </svg>
    </div>

    <img src="songs/${folder}/cover.jpg" alt="">
    <h2>${response.title}</h2>
    <p>${response.description}</p>
  </div>`
          }
     }

     //load the library whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        const folder = item.currentTarget.dataset.folder;
        console.log("Opening folder:", folder);
        await getSongs(`songs/${folder}`);
        playMusic(songs[0])
          })
     })
}

async function main() {

     //get the list of all the songs
     await getSongs("songs/ncs")
     playMusic(songs[0], true)

     //display all the albums on the page
     displayAlbums()
     //attach an event listener to play,next and previous
     play.addEventListener("click", () => {
          if (currentSong.paused) {
               currentSong.play()
               play.src = "pause.svg"
          }
          else {
               currentSong.pause()
               play.src = "play.svg"
          }
     })

     //listen for time update event
     currentSong.addEventListener("timeupdate", () => {
          document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.
               currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
          document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
     })


     // add an event listener to seekbar
     document.querySelector(".seekbar").addEventListener("click", e => {
          let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
          document.querySelector(".circle").style.left = percent + "%";
          currentSong.currentTime = ((currentSong.duration) * percent) / 100
     })

     //add an event listener for hamburger
     document.querySelector(".hamburger").addEventListener("click", () => {
          document.querySelector(".left").style.left = "0"
     })

     //add an event listener for close button
     document.querySelector(".close").addEventListener("click", () => {
          document.querySelector(".left").style.left = "-120%"
     })

     //add an event listener to previous 
     previous.addEventListener("click", () => {
          currentSong.pause()

          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
          if ((index - 1) >= 0) {
               playMusic(songs[index - 1])
          }
     })

     //add an event listener to next 
     next.addEventListener("click", () => {
          currentSong.pause()
          

          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
          if ((index + 1) < songs.length) {
               playMusic(songs[index + 1])
          }
     })


     //add an event to volume
     document.querySelector(".range").getElementsByTagName("input")[0].
     addEventListener("change", (e) => {
          currentSong.volume = parseInt(e.target.value) / 100
          if (currentSong.volume>0) {
          document.querySelector(".volume img").src=document.querySelector(".volume img").src.replace("mute.svg","volume.svg")     
          }
     })

     //add event listener to mute the track
     document.querySelector(".volume img").addEventListener("click",e=>{
     if (e.target.src.includes("volume.svg")) {
          e.target.src=e.target.src.replace("volume.svg","mute.svg")
          currentSong.volume =0;
          document.querySelector(".range").getElementsByTagName("input")[0].value=0;
     }
     else{
         e.target.src=e.target.src.replace("mute.svg","volume.svg")
          currentSong.volume =.10;
          document.querySelector(".range").getElementsByTagName("input")[0].value=10;
     }    
     })


}


main()









