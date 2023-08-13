"use strict";

const audioPlayer = document.getElementById('audioPlayer');
const songList = document.getElementById('songList');

songList.addEventListener('dragover', (e) => {
	e.preventDefault();
});

songList.addEventListener('drop', (e) => {
	e.preventDefault();
	songList.classList.remove('highlight');
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

function playSong(file) {
    const fileURL = URL.createObjectURL(file);
    audioPlayer.src = fileURL;
    audioPlayer.load();
    audioPlayer.play();
}
