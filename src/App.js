import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const storedPlaylist = JSON.parse(localStorage.getItem('playlist'));
    if (storedPlaylist) {
      setPlaylist(storedPlaylist);
    }

    const lastPlayingTrackIndex = JSON.parse(localStorage.getItem('currentTrackIndex'));
    if (lastPlayingTrackIndex !== null) {
      setCurrentTrackIndex(lastPlayingTrackIndex);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('currentTrackIndex', JSON.stringify(currentTrackIndex));
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.volume = volume;
      if (isPlaying && !audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
  }, [isPlaying, volume, audioPlayer]);

  const handleAudioEnded = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const handleFileUpload = (event) => {
    const newTrack = event.target.files[0];
    if(newTrack){
      setPlaylist([...playlist, newTrack]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value));
  };

  const handleCanPlayThrough = () => {
    if (isPlaying && audioPlayer && playlist.length > 0) {
      audioPlayer.play();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="app-container">
      <input type="file" accept="audio/*" id="file-input" onChange={handleFileUpload} className="file-input visually-hidden" />
      <label htmlFor="file-input" className="file-upload-button">Upload Audio File</label>
      <div className="playlist-container">
        {playlist.map((track, index) => (
          <div key={index} className="track-item">
            <span>{track.name}</span>
            <hr className="separator" />
          </div>
        ))}
      </div>
      {playlist.length > 0 && (
        <div className="audio-player-container">
          <div className="audio-controls">
            <button className="control-button" onClick={handlePrevTrack}>
              <i className="fas fa-backward"></i>
            </button>
            <button className="control-button" onClick={handlePlayPause}>
              {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
            </button>
            <button className="control-button" onClick={handleNextTrack}>
              <i className="fas fa-forward"></i>
            </button>
          </div>
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={audioPlayer ? audioPlayer.duration : 0}
              value={audioPlayer ? audioPlayer.currentTime : 0}
              className="progress"
              onChange={(e) => (audioPlayer.currentTime = e.target.value)}
            />
            <div className="time-display">
              <span>{formatTime(audioPlayer ? audioPlayer.currentTime : 0)}</span> / <span>{formatTime(audioPlayer ? audioPlayer.duration : 0)}</span>
            </div>
          </div>
          <div className="volume-container">
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="volume-slider" />
            <span className="volume-percentage">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
      {playlist.length > 0 && (
        <audio
          ref={(audio) => setAudioPlayer(audio)}
          src={URL.createObjectURL(playlist[currentTrackIndex])}
          onEnded={handleAudioEnded}
          autoPlay={playlist.length === 1} // Only autoplay if there's only one track
          onCanPlayThrough={handleCanPlayThrough}
          className="visually-hidden"
        />
      )}
    </div>
  );
};

export default App;
