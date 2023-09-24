(() => {
	"use strict";

	class JukeBox {
		constructor({
			audioElement,
			canvasElement,
			nextButton,
			playButton,
			previousButton,
			progressBarElement,
			songListElement,
			songTitleLabel,
			visualizerCanvas,
		}) {
			this.audioElement = audioElement;
			this.canvasElement = canvasElement;
			this.nextButton = nextButton;
			this.playButton = playButton;
			this.previousButton = previousButton;
			this.progressBarElement = progressBarElement;
			this.songListElement = songListElement;
			this.songTitleLabel = songTitleLabel;
			this.canvasElement = visualizerCanvas;
		}

		init() {
			this.playerInterface = new PlayerInterface({
				jukeBox: this,
				nextButton: this.nextButton,
				playButton: this.playButton,
				previousButton: this.previousButton,
			});

			this.progressBar = new ProgressBar({
				audioElement: this.audioElement,
				progressBarElement: this.progressBarElement,
			});

			this.songList = new SongList({
				songListElement: this.songListElement,
			});

			this.visualizer = new Visualizer({
				audioElement: this.audioElement,
				canvasElement: this.canvasElement,
			});

			this.audioElement.addEventListener("ended", () => {
				this.playNextSong();
			});

			this.playerInterface.init();
			this.progressBar.init();
			this.songList.init();
			this.visualizer.init();
		}

		play() {
			const currentPlayingSong = document.querySelector(".playing");
			
			if (currentPlayingSong) {
				this.togglePlayPause();
			} else {
				const firstSong = songList.querySelector("li");
		
				if (firstSong) {
					playSong(firstSong);
				}
			}
		}

		playNextSong() {
			if (this.songList.playNextSong()) {
				this.reset();
			}
		}

		playPreviousSong() {
			this.songList.playPreviousSong();
		}

		reset() {
			this.progressBar.reset();
			this.songList.reset();
		}

		togglePlayPause() {
			if (this.audioElement.paused) {
				this.audioElement.play();
			} else {
				this.audioElement.pause();
			}
		}	
	}

	class PlayerInterface {
		constructor({
			jukeBox,
			nextButton,
			playButton,
			previousButton,
		}) {
			this.jukeBox = jukeBox;
			this.nextButton = nextButton;
			this.playButton = playButton;
			this.previousButton = previousButton;
		}

		init() {	
			this.playButton.addEventListener("click", () => {
				this.play();
			});
			
			this.nextButton.addEventListener("click", () => {
				this.playNextSong();
			});

			this.previousButton.addEventListener("click", () => {
				this.playPreviousSong();
			});
		}

		play() {
			this.jukeBox.play();
		}

		playNextSong() {
			this.jukeBox.playNextSong();
		}

		playPreviousSong() {
			this.jukeBox.playPreviousSong();
		}
	}

	class ProgressBar {
		constructor({ audioElement, progressBarElement }) {
			this.audioElement = audioElement;
			this.progressBarElement = progressBarElement;
		}

		init() {
			this.audioElement.addEventListener("timeupdate", () => {
				this.update();
			});				

			this.progressBarElement.addEventListener("mousedown", (e) => {
				this.interact(e.clientX);
			});
			
			document.addEventListener("mousemove", (e) => {
				if (this.progressBarElement.isDragging) {
					interact(e.clientX);
				}
			});
			
			document.addEventListener("mouseup", () => {
				this.progressBarElement.isDragging = false;
			});			
		}

		interact(clientX) {
			const progressBarRect = this.progressBarElement.getBoundingClientRect();
			const offsetX = clientX - progressBarRect.left;
			const progressPercentage = (offsetX / progressBarRect.width) * 100;
		
			if (progressPercentage >= 0 && progressPercentage <= 100) {
				this.progressBarElement.value = progressPercentage;
				this.audioElement.currentTime = (progressPercentage / 100) * this.audioElement.duration;
			}
		}

		reset() {
			this.progressBarElement.value = 0;
		}

		update() {
			const currentTime = this.audioElement.currentTime;
			const duration = this.audioElement.duration;
		
			if (!isNaN(duration)) {
				this.progressBarElement.value = (currentTime / duration) * 100;
			}
		}
	}

	class SongList {
		constructor({ songListElement }) {
			this.songListElement = songListElement;
		}

		init() {
			this.songListElement.addEventListener("dragend", (e) => {
				e.target.classList.remove("dragging");
			});
			
			this.songListElement.addEventListener("dragstart", (e) => {
				e.target.classList.add("dragging");
			});
			
			this.songListElement.addEventListener("drop", (e) => {
				e.preventDefault();
				this.fileDrop(e.dataTransfer.files);
			});

			songList.addEventListener("dragover", (e) => {
				const dragging = document.querySelector(".dragging");
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
		}

		addSongToList(file) {
			const songItem = document.createElement("li");
			songItem.draggable = true;
			songItem.file = file;
			songItem.id = file.name;
		
			const playButton = document.createElement("button");
			const playIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			const playPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
			playIcon.setAttribute("width", "20");
			playIcon.setAttribute("height", "20");
			playIcon.setAttribute("viewBox", "0 0 24 24");
			playPath.setAttribute("d", "M8 5v14l11-7z");
			playIcon.appendChild(playPath);
			playButton.appendChild(playIcon);
			playButton.classList.add("play-song-btn");
		
			playButton.addEventListener("click", () => {
				this.playSong(songItem);
			});
		
			songItem.appendChild(playButton);
			songItem.appendChild(document.createTextNode(file.name));
			this.songListElement.querySelector("ul").appendChild(songItem);
		}

		fileDrop(files) {
			this.songListElement.classList.remove("highlight");
		
			for (const file of files) {
				this.addSongToList(file);
			}
		}

		playNextSong() {
			const currentSongIndex = this.getCurrentSongIndex();
			const songItems = this.songListElement.querySelectorAll("li");

			if (currentSongIndex >= songItems.length - 1) {
				return true;
			}
		
			const nextSongItem = songItems[currentSongIndex + 1];
			this.playSong(nextSongItem);
		}

		playPreviousSong() {
			const currentSongIndex = this.getCurrentSongIndex();
		
			if (currentSongIndex > 0) {
				const prevSongItem = this.songListElement.querySelectorAll("li")[currentSongIndex - 1];
				this.playSong(prevSongItem);
			}
		}
		
		getCurrentSongIndex() {
			const songItems = this.songListElement.querySelectorAll("li");
			const currentSong = document.querySelector(".playing");
		
			return Array.from(songItems).indexOf(currentSong);
		}		
		
		playSong(songItem) {
			const currentPlayingSong = document.querySelector(".playing");
		
			if (currentPlayingSong) {
				currentPlayingSong.classList.remove("playing");
			}
		
			songItem.classList.add("playing");
			const fileURL = URL.createObjectURL(songItem.file);
			audioElement.src = fileURL;
			audioElement.load();
			audioElement.play();
		}
		
			
		reset() {
			const currentPlayingSong = document.querySelector(".playing");
		
			if (currentPlayingSong) {
				currentPlayingSong.classList.remove("playing");
			}
		}
	}

	class Visualizer {
		constructor({ audioElement, canvasElement }) {
			this.audioElement = audioElement;
			this.canvasElement = canvasElement;
		}

		init() {
			this.analyser = this.createAnalyser();
			this.visualizerContext = this.canvasElement.getContext("2d");
			this.update();
		}

		createAnalyser() {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const source = audioContext.createMediaElementSource(this.audioElement);
			const analyser = audioContext.createAnalyser();
			source.connect(analyser);
			analyser.connect(audioContext.destination);
			analyser.fftSize = 256;

			return analyser;
		}

		update() {
			const bufferLength = this.analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			this.visualizerContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
			this.analyser.getByteFrequencyData(dataArray);
			const barWidth = (this.canvasElement.width / bufferLength) * 2;
			let x = 0;
		
			for (let i = 0; i < bufferLength; ++i) {
				const barHeight = (dataArray[i] / 255) * this.canvasElement.height;
				this.visualizerContext.fillStyle = `rgb(50, 50, ${i * 4})`;
				this.visualizerContext.fillRect(x, this.canvasElement.height - barHeight, barWidth, barHeight);
				x += barWidth + 1;
			}
		
			requestAnimationFrame(() => {
				this.update();
			});
		}	
	}
		
	function main() {
		const jukeBox = new JukeBox({
			audioElement: document.getElementById("audioElement"),
			canvasElement: document.getElementById("visualizer"),
			nextButton: document.getElementById("nextButton"),
			playButton: document.getElementById("playButton"),
			previousButton: document.getElementById("previousButton"),
			progressBarElement: document.getElementById("progressBar"),
			songListElement: document.getElementById("songList"),
			songTitleLabel: document.getElementById("songTitleLabel"),
			visualizerCanvas: document.getElementById("visualizer"),
	 	});

		jukeBox.init();
	}

	main();	
})();
