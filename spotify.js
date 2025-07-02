console.log('Lets write JavaScript');
let currentsong = new Audio();
let currentfolder;
let songs = [];

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

async function getsongs(folder) {
    currentfolder = folder;
    let a = await fetch(`/SPOTIFY/${currentfolder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let filename = decodeURIComponent(element.href.split("/").pop());
            songs.push(filename);
        }

    }
    //display all the albums on the page

    //showing in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let filename = song.split("/").pop();
        filename = decodeURIComponent(filename);
        let name = filename
            .replace(/\.mp3$/, "")    // remove extension
            .replace(/[-(].*$/, "")   // remove anything after - or (
            .trim();

        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="music">
            <div class="info">
                <div>${name}</div>
                <div style="display:none" class="filename">${filename}</div>  <!-- hidden filename -->
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="play">
            </div>
        </li>`;
    }

    //event to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const filename = e.querySelector(".info .filename").textContent;
            console.log("Playing:", filename);
            playMusic(filename);
        });
    });
    return songs;
}

const playMusic = (filename, pause = false) => {
    currentsong.src = `/SPOTIFY/${currentfolder}/` + encodeURIComponent(filename);
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    let name = filename
        .replace(/\.mp3$/, "")    // remove extension
        .replace(/[-(].*$/, "")   // remove anything after - or (
        .trim();
    document.querySelector(".songinfo").innerHTML = decodeURI(name)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    console.log("Displaying albums...");
    let a = await fetch(`/SPOTIFY/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardcont = document.querySelector(".cardcont");
    cardcont.innerHTML = ""; // Clear existing cards

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess") && e.href.endsWith("/")) {
            let folder = e.href.split("/").slice(-2)[0];

            try {
                let infoRes = await fetch(`/SPOTIFY/songs/${folder}/info.json`);
                if (!infoRes.ok) throw new Error(`Missing info.json in ${folder}`);
                let info = await infoRes.json();

                cardcont.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="cardimg">
                        <img src="/SPOTIFY/songs/${folder}/cover.jpeg" alt="">
                    </div>
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="cardtext">
                        <h4>${info.title}</h4>
                        <p>${info.description}</p>
                    </div>
                </div>`;
            } catch (err) {
                console.error(err.message);
            }
        }
    }

    // Load songs on click
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            console.log(`Loading songs from folder: ${folder}`);
            await getsongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });

}


async function displayArtist() {
    console.log("Displaying artists...");
    let a = await fetch(`/SPOTIFY/Artist/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let artistcont = document.querySelector(".artistcont");
    artistcont.innerHTML = ""; // Clear existing artists

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Artist/") && !e.href.includes(".htaccess") && e.href.endsWith("/")) {
            let folder = e.href.split("/").slice(-2)[0];

            try {
                let infoRes = await fetch(`/SPOTIFY/Artist/${folder}/info.json`);
                if (!infoRes.ok) throw new Error(`Missing info.json in ${folder}`);
                let info = await infoRes.json();

                artistcont.innerHTML += `
                <div class="artist">
                    <div data-folder="${folder}" class="artimg">
                        <img src="/SPOTIFY/Artist/${folder}/cover.jpeg" alt="${info.title}">
                    </div>
                    <div class="arttext">
                        <h4>${info.title}</h4>
                        <p>Artist</p>
                    </div>
                </div>`;
            } catch (err) {
                console.error(err.message);
            }
        }
    }

    // Load songs on click
    Array.from(document.querySelectorAll(".artimg")).forEach(img => {
        img.addEventListener("click", async () => {
            const folder = img.dataset.folder;
            console.log(`Loading songs from Artist folder: ${folder}`);
            await getsongs(`Artist/${folder}`);
            playMusic(songs[0]);
        });
    });
}




async function main() {
    //getting songs
    await getsongs("songs/ncs")
    console.log(songs)
    playMusic(songs[0], true)

    await displayAlbums();
    await displayArtist();

    //event to play buttons
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // PREVIOUS BUTTON
    previous.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("Already at first song");
            playMusic(songs[0]);  //  stay on the first song (won’t pause)
        }
    });


    //  NEXT BUTTON
    next.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("Already at last song");
            playMusic(songs[songs.length - 1]);  // stay on last song
        }
    });




    //time update
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //seekbar update
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-400px"
    })




}

main()
