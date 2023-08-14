"use strict";

const audioPlayer = document.getElementById('audioPlayer');
const progressBar = document.getElementById('progressBar');
const songList = document.getElementById('songList');
const playButton = document.getElementById('playButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');

audioPlayer.addEventListener('ended', () => {
    playNextSong();
});

audioPlayer.addEventListener('timeupdate', () => {
	const currentTime = audioPlayer.currentTime;
	const duration = audioPlayer.duration;
	const progressPercentage = (currentTime / duration) * 100;
	progressBar.style.width = progressPercentage + '%';
});

playButton.addEventListener('click', () => {
	const currentPlayingSong = document.querySelector('.playing');

    if (currentPlayingSong) {
        togglePlayPause(currentPlayingSong);
    } else {
        const firstSong = songList.querySelector('li');

		if (firstSong) {
            playSong(firstSong);
        }
    }
});

previousButton.addEventListener('click', () => {
	playPreviousSong();
});

nextButton.addEventListener('click', () => {
	playNextSong();
});

function playPreviousSong() {
	const currentSongIndex = getCurrentSongIndex();

	if (currentSongIndex > 0) {
		const prevSongItem = songList.querySelectorAll('li')[currentSongIndex - 1];
		playSong(prevSongItem);
	}
}

function playNextSong() {
	const currentSongIndex = getCurrentSongIndex();
	const songItems = songList.querySelectorAll('li');

	if (currentSongIndex < songItems.length - 1) {
		const nextSongItem = songItems[currentSongIndex + 1];
		playSong(nextSongItem);
	}
}

function getCurrentSongIndex() {
	const songItems = songList.querySelectorAll('li');
	const currentSong = document.querySelector('.playing');

	return Array.from(songItems).indexOf(currentSong);
}


songList.addEventListener('dragend', (e) => {
	e.target.classList.remove('dragging');
});

songList.addEventListener('dragover', (e) => {
	const dragging = document.querySelector('.dragging');
	const target = e.target;

	e.preventDefault();

	if (!dragging) {
		return;
	}

	if (dragging.parentNode != target.parentNode) {
		return;
	}

	if (isBefore(dragging, target)) {
		target.parentNode.insertBefore(dragging, target);
	} else {
		target.parentNode.insertBefore(dragging, target.nextSibling);
	}

	function isBefore(dragging, target) {
		for (let current = dragging.previousSibling; current; current = current.previousSibling) {
			if (current == target) {
				return true;
			}
		}

		return false;
	}
});

songList.addEventListener('dragstart', (e) => {
	e.target.classList.add('dragging');
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
	songItem.draggable = true;
	songItem.file = file;
	songItem.id = file.name;

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
		playSong(songItem);
	});

	songItem.appendChild(playButton);
	songItem.appendChild(document.createTextNode(file.name));
	songList.querySelector('ul').appendChild(songItem);
}

function playSong(songItem) {
	const currentPlayingSong = document.querySelector('.playing');

	if (currentPlayingSong) {
		currentPlayingSong.classList.remove('playing');
	}

	songItem.classList.add('playing');
	const fileURL = URL.createObjectURL(songItem.file);
	audioPlayer.src = fileURL;
	audioPlayer.load();
	audioPlayer.play();
}

function togglePlayPause(songItem) {
    if (audioPlayer.paused) {
        audioPlayer.play();
        // songItem.classList.add('playing');
    } else {
        audioPlayer.pause();
        // songItem.classList.remove('playing');
    }
}
