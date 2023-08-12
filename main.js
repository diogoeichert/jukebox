const songList = document.getElementById('songList');
const dropZone = document.getElementById('dropZone');

// Prevent default behaviors on drag events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('highlight');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('highlight');
});

// Handle file drop
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('highlight');

    const files = e.dataTransfer.files;
    for (const file of files) {
        addSongToList(file);
    }
});

function addSongToList(file) {
    const songItem = document.createElement('li');
    const playButton = document.createElement('button');
    const playIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const playPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

    playIcon.setAttribute("width", "20");
    playIcon.setAttribute("height", "20");
    playIcon.setAttribute("viewBox", "0 0 24 24");
    playPath.setAttribute("d", "M8 5v14l11-7z");

    playIcon.appendChild(playPath);
    playButton.appendChild(playIcon);

    playButton.classList.add('play-song-btn');
    playButton.addEventListener('click', () => {
        playSong(file);
    });

    songItem.appendChild(playButton);
    songItem.appendChild(document.createTextNode(file.name));

    songList.querySelector('ul').appendChild(songItem);
}

// Play buttons
const playSongButtons = document.querySelectorAll('.play-song-btn');

playSongButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const songName = button.nextElementSibling.textContent;
        // Replace this with your actual play song function
        playSong(songName);
    });
});

function playSong(file) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.querySelector('source');

    const fileURL = URL.createObjectURL(file);

    audioSource.src = fileURL;
    audioPlayer.load();
    audioPlayer.play();
}
