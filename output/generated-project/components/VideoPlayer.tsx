'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import { ErrorState } from './ui/ErrorState';
import { cn } from '@/lib/utils';

export interface VideoPlayerProps {
  url: string;
  onTimeUpdate?: (time: number) => void;
  markers?: Array<{ timestamp: number; color?: string }>;
  onMarkerClick?: (timestamp: number) => void;
  className?: string;
}

export function VideoPlayer({
  url,
  onTimeUpdate,
  markers = [],
  onMarkerClick,
  className,
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Define functions used in effects first
  const seekRelative = useCallback((seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime);
    }
  }, [duration]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (playing && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, showControls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setMuted((m) => !m);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [seekRelative, toggleFullscreen]);

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
      if (onTimeUpdate) {
        onTimeUpdate(state.playedSeconds);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const newPlayed = x / bounds.width;
    setPlayed(newPlayed);
    playerRef.current?.seekTo(newPlayed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setHasError(false);
    setIsReady(false);
    setPlaying(false);
  };

  if (hasError) {
    return (
      <div className={cn('aspect-video bg-gray-900 rounded-lg', className)}>
        <ErrorState
          title="Failed to load video"
          message="There was a problem loading the video. Please try again."
          onRetry={handleRetry}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-video bg-gray-900 rounded-lg overflow-hidden group', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onClick={() => setPlaying((p) => !p)}
    >
      {/* Loading skeleton */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* React Player */}
      {React.createElement(ReactPlayer as any, {
        ref: playerRef,
        url: url,
        playing: playing,
        volume: volume,
        muted: muted,
        playbackRate: playbackRate,
        width: "100%",
        height: "100%",
        onReady: () => setIsReady(true),
        onDuration: setDuration,
        onProgress: handleProgress,
        onError: () => setHasError(true),
        config: {
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        },
      })}

      {/* Center play/pause button */}
      {isReady && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            playing && !showControls ? 'opacity-0' : 'opacity-100'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 hover:bg-black/80 transition-colors cursor-pointer">
            {playing ? (
              <Pause className="h-12 w-12 text-white" />
            ) : (
              <Play className="h-12 w-12 text-white ml-1" />
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {isReady && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timeline with markers */}
          <div className="mb-3 relative">
            <div
              className="h-2 bg-white/30 rounded-full cursor-pointer hover:h-3 transition-all group/timeline"
              onClick={handleSeek}
              onMouseDown={() => setSeeking(true)}
              onMouseUp={() => setSeeking(false)}
            >
              <div
                className="h-full bg-primary-500 rounded-full relative"
                style={{ width: `${played * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 transition-opacity"></div>
              </div>
              {/* Timestamp markers */}
              {markers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    left: `${(marker.timestamp / duration) * 100}%`,
                    backgroundColor: marker.color || '#0284c7',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playerRef.current?.seekTo(marker.timestamp);
                    if (onMarkerClick) {
                      onMarkerClick(marker.timestamp);
                    }
                  }}
                  title={`Jump to ${formatTime(marker.timestamp)}`}
                />
              ))}
            </div>
          </div>

          {/* Control bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={() => setPlaying((p) => !p)}
                className="hover:text-primary-400 transition-colors"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2 group/volume">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="hover:text-primary-400 transition-colors"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    setMuted(newVolume === 0);
                  }}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-primary-500"
                />
              </div>

              {/* Time display */}
              <span className="text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Playback speed */}
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Playback speed"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-primary-400 transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
