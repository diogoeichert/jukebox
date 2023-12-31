"use strict";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioPlayer = document.getElementById('audioPlayer');
const analyser = createAnalyser(audioContext, audioPlayer);
const progressBar = document.getElementById('progressBar');
const songList = document.getElementById('songList');
const songTitleLabel = document.getElementById('songTitleLabel');
const playButton = document.getElementById('playButton');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const visualizerCanvas = document.getElementById('visualizer');
const visualizerContext = visualizerCanvas.getContext('2d');

audioPlayer.addEventListener('ended', () => {
	playNextSong();
});

audioPlayer.addEventListener('timeupdate', () => {
	const currentTime = audioPlayer.currentTime;
	const duration = audioPlayer.duration;

	if (!isNaN(duration)) {
		progressBar.value = (currentTime / duration) * 100;
	}
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
	} else {
		const currentPlayingSong = document.querySelector('.playing');
		progressBar.value = 0;

		if (currentPlayingSong) {
			currentPlayingSong.classList.remove('playing');
		}
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

function createAnalyser(audioContext, audioElement) {
	const source = audioContext.createMediaElementSource(audioElement);
	const analyser = audioContext.createAnalyser();
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	analyser.fftSize = 256;
	return analyser;
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
	songTitleLabel.innerHTML = songItem.file.name;
}

function togglePlayPause(songItem) {
	if (audioPlayer.paused) {
		audioPlayer.play();
	} else {
		audioPlayer.pause();
	}
}

progressBar.addEventListener('mousedown', (e) => {
	updateProgressBar(e.clientX);
});

document.addEventListener('mousemove', (e) => {
	if (progressBar.isDragging) {
		updateProgressBar(e.clientX);
	}
});

document.addEventListener('mouseup', () => {
	progressBar.isDragging = false;
});

function updateProgressBar(clientX) {
	const progressBarRect = progressBar.getBoundingClientRect();
	const offsetX = clientX - progressBarRect.left;
	const progressPercentage = (offsetX / progressBarRect.width) * 100;

	if (progressPercentage >= 0 && progressPercentage <= 100) {
		progressBar.value = progressPercentage;
		audioPlayer.currentTime = (progressPercentage / 100) * audioPlayer.duration;
	}
}

function visualize() {
	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	visualizerContext.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
	analyser.getByteFrequencyData(dataArray);
	const barWidth = (visualizerCanvas.width / bufferLength) * 2;
	let x = 0;

	for (let i = 0; i < bufferLength; ++i) {
		const barHeight = (dataArray[i] / 255) * visualizerCanvas.height;
		visualizerContext.fillStyle = `rgb(50, 50, ${i * 4})`;
		visualizerContext.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
		x += barWidth + 1;
	}

	requestAnimationFrame(visualize);
}

visualize();
