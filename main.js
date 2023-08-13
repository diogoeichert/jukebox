"use strict";

const audioPlayer = document.querySelector('#audioPlayer');
const songList = document.querySelector('#songList');

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
	songItem.id = file.name

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
