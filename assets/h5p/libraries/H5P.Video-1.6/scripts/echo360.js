/** @namespace Echo */
H5P.VideoEchoVideo = (() => {

  let numInstances = 0;

  const CONTROLS_HEIGHT = 100;

  /**
   * EchoVideo video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function EchoPlayer(sources, options, l10n) {
    // State variables for the Player.
    let player = undefined;
    let buffered = 0;
    let currentQuality;
    let trackOptions = [];
    let currentTime = 0;
    let duration = 0;
    let isMuted = false;
    let loadingComplete = false;
    let volume = 1;
    let playbackRate = 1;
    let qualities = [];
    let loadingFailedTimeout;
    let failedLoading = false;
    let ratio = 9 / 16;
    let currentState = H5P.Video.VIDEO_CUED;
    // Echo360 server doesn't sync seek time with regular play time fast enough
    let timelineUpdatesToSkip = 0;
    let timeUpdateTimeout;

    /*
     * Echo360 player does send time updates ~ 0.25 seconds by default and
     * ends playing the video without sending a final time update or an
     * Video Ended event. We take care of determining reaching the video end
     * ourselves.
     */
    const echoMinUncertaintyCompensationS = 0.3;
    const timelineUpdateDeltaSlackMS = 50;
    let echoUncertaintyCompensationS = echoMinUncertaintyCompensationS;
    let previousTickMS;

    // Player specific immutable variables.
    const LOADING_TIMEOUT_IN_SECONDS = 30;
    const id = `h5p-echo-${++numInstances}`;
    const instanceId = H5P.createUUID();
    const wrapperElement = document.createElement('div');

    const placeholderElement = document.createElement('div');
    placeholderElement.classList.add('h5p-video-loading');
    placeholderElement.setAttribute('style', 'height: 100%; min-height: 200px; display: block; z-index: 100; border: none;');
    placeholderElement.setAttribute('aria-label', l10n.loading);

    wrapperElement.setAttribute('id', id);
    wrapperElement.append(placeholderElement);

    /**
     * Remove all elements from the placeholder dom element.
     *
     * @private
     */
    const removeLoadingIndicator = () => {
      placeholderElement.replaceChildren();
    };

    /**
     * Generate an array of objects for use in a dropdown from the list of resolutions.
     * @private
     * @param {Array} qualityLevels - list of objects with supported qualities for the media
     * @returns {Array} list of objects with label and name properties
     */
    const mapQualityLevels = (qualityLevels) => {
      const qualities = qualityLevels.map((quality) => {
        return { label: quality.label.toLowerCase(), name: quality.value };
      });
      return qualities;
    };

    /**
     * Register event listeners on the given Echo player.
     *
     * @private
     * @param {HTMLElement} player
     */
    const registerEchoPlayerEventListeneners = (player) => {
      player.resolveLoading = null;
      player.loadingPromise = new Promise((resolve) => {
        player.resolveLoading = resolve;
      });
      player.onload = async () => {
        clearTimeout(loadingFailedTimeout);
        player.loadingPromise.then(async () => {
          this.trigger('ready');
          this.trigger('loaded');
          this.loadingComplete = true;
          this.trigger('resize');
          if (trackOptions.length) {
            this.trigger('captions', trackOptions);
          }

          const autoplayIsAllowed = !window.H5PEditor &&
            await H5P.Video.isAutoplayAllowed();
          if (options.autoplay && autoplayIsAllowed) {
            this.play();
          }

          return true;
        });
      };
      window.addEventListener('message', (event) => {
        let message = '';

        try {
          message = JSON.parse(event.data);
        }
        catch (e) {
          return;
        }
        if (
          message.context !== 'Echo360' || message.instanceId !== instanceId
        ) {
          return;
        }

        if (message.event === 'init') {
          // Set ratio if width and height is received from Echo360
          if (message.data.width && message.data.height) {
            // If controls are displayed we have to add a magic height to make it visible :(
            ratio = ((message.data.height + (options.controls ? CONTROLS_HEIGHT : 0)) / message.data.width);
          }

          duration = message.data.duration;
          this.setCurrentTime(message.data.currentTime ?? 0);

          textTracks = message.data.textTracks ?? [];
          if (message.data.captions) {
            trackOptions = textTracks.map((track) =>
              new H5P.Video.LabelValue(track.label, track.value)
            );
          }
          player.resolveLoading();

          // Player sends `init` event after rebuffering, unfortunately.
          if (!this.wasInitialized) {
            qualities = mapQualityLevels(message.data.qualityOptions);
            currentQuality = qualities[0].name;
            this.trigger('qualityChange', currentQuality);
          }

          this.trigger('resize');
          if (message.data.playing) {
            changeState(H5P.Video.PLAYING);
          }

          this.wasInitialized = true;
        }
        else if (message.event === 'timeline') {
          updateUncertaintyCompensation();

          duration = message.data.duration ?? this.getDuration();

          if (timelineUpdatesToSkip === 0) {
            this.setCurrentTime(message.data.currentTime ?? 0);
          }
          else {
            timelineUpdatesToSkip--;
          }

          /*
           * Should work, but it was better if the player itself clearly sent
           * the state (playing, paused, ended) instead of us having to infer.
           */
          const compensatedTime = this.getCurrentTime() +
            echoUncertaintyCompensationS * this.getPlaybackRate()

          if (
            currentState === H5P.Video.PLAYING &&
              Math.ceil(compensatedTime) >= duration
          ) {
            changeState(H5P.Video.ENDED);

            if (options.loop) {
              this.seek(0);
              this.play();
            }
            return;
          }

          if (message.data.playing) {
            timeUpdate(currentTime);
            changeState(H5P.Video.PLAYING);
          }
          else if (currentState === H5P.Video.PLAYING) {
            // Condition prevents video to be paused on startup
            changeState(H5P.Video.PAUSED);
            window.clearTimeout(timeUpdateTimeout);
          }
        }
      });
    };

    /**
     * Update the uncertainty compensation value.
     * Computes the delta time between the last two timeline events sent by the
     * Echo360 player and updates the compensation value.
     */
    const updateUncertaintyCompensation = () => {
      if (currentState === H5P.Video.PLAYING) {
        const time = Date.now();

        if (previousTickMS) {
          echoUncertaintyCompensationS = Math.max(
            echoMinUncertaintyCompensationS,
            (time - previousTickMS + timelineUpdateDeltaSlackMS) /
              1000
          )
        } else {
          echoUncertaintyCompensationS = echoMinUncertaintyCompensationS;
        }

        previousTickMS = time;
      }
      else {
        delete previousTickMS;
      }
    }

    /**
     * Change state of the player.
     * @param {number} state State id (H5P.Video[statename]).
     */
    const changeState = (state) => {
      if (state !== currentState) {
        currentState = state;
        this.trigger('stateChange', state);
      }
    };

    /**
     * Determine if the element is visible by computing the styles.
     *
     * @private
     * @param {HTMLElement} node - the element to check.
     * @returns {Boolean} true if it is visible.
     */
    const isNodeVisible = (node) => {
      let style = window.getComputedStyle(node);

      if (node.offsetWidth === 0) {
        return false;
      }

      return ((style.display !== 'none') && (style.visibility !== 'hidden'));
    };

    const timeUpdate = (time) => {
      window.clearTimeout(timeUpdateTimeout);

      this.lastTimeUpdate = Date.now();

      timeUpdateTimeout = window.setTimeout(() => {
        if (currentState !== H5P.Video.PLAYING) {
          return;
        }

        const delta = (Date.now() - this.lastTimeUpdate) * this.getPlaybackRate();
        this.setCurrentTime(currentTime + delta / 1000);
        timeUpdate(currentTime);
      }, 40); // 25 fps
    }

    /**
     * Create a new player by embedding an iframe.
     *
     * @private
     * @returns {Promise}
     */
    const createEchoPlayer = async () => {
      if (!isNodeVisible(placeholderElement) || player !== undefined) {
        return;
      }
      // Since the SDK is loaded asynchronously below, explicitly set player to
      // null (unlike undefined) which indicates that creation has begun. This
      // allows the guard statement above to be hit if this function is called
      // more than once.
      player = null;
      let queryString = '?';

      queryString += `instanceId=${instanceId}&`;

      if (options.controls) {
        queryString += 'controls=true&';
      }
      if (options.disableFullscreen) {
        queryString += 'disableFullscreen=true&';
      }
      if (options.deactivateSound) {
        queryString += 'deactivateSound=true&';
      }
      if (options.startAt) {
        queryString += `startTimeMillis=${Math.round(options.startAt * 1000)}&`;
      }

      wrapperElement.innerHTML = `<iframe src="${sources[0].path}${queryString}" style="display: inline-block; width: 100%; height: 100%;" allow="autoplay; fullscreen" frameborder="0" scrolling="no"></iframe>`;
      player = wrapperElement.firstChild;
      // Create a new player
      registerEchoPlayerEventListeneners(player);
      loadingFailedTimeout = setTimeout(() => {
        failedLoading = true;
        removeLoadingIndicator();
        wrapperElement.innerHTML = `<p class="echo-failed-loading">${l10n.unknownError}</p>`;
        wrapperElement.style.cssText = 'width: null; height: null;';
        this.trigger('resize');
        this.trigger('error', l10n.unknownError);
      }, LOADING_TIMEOUT_IN_SECONDS * 1000);
    };

    /**
     * Appends the video player to the DOM.
     *
     * @public
     * @param {jQuery} $container
     */
    this.appendTo = ($container) => {
      $container.addClass('h5p-echo').append(wrapperElement);
      createEchoPlayer();
    };

    /**
     * Determine if the video has loaded.
     *
     * @public
     * @returns {Boolean}
     */
    this.isLoaded = () => {
      return loadingComplete;
    };

    /**
     * Get list of available qualities.
     *
     * @public
     * @returns {Array}
     */
    this.getQualities = () => {
      return qualities;
    };

    /**
     * Get the current quality.
     *
     * @public
     * @returns {String} Current quality identifier
     */
    this.getQuality = () => {
      return currentQuality;
    };

    /**
     * Set the playback quality.
     *
     * @public
     * @param {String} quality
     */
    this.setQuality = async (quality) => {
      this.post('quality', quality);
      currentQuality = quality;
      this.trigger('qualityChange', currentQuality);
    };

    /**
     * Start the video.
     *
     * @public
     */
    this.play = () => {
      if (!player) {
        this.on('ready', this.play);
        return;
      }
      this.post('play', 0);
    };

    /**
     * Pause the video.
     *
     * @public
     */
    this.pause = () => {
      // Compensate for Echo360's delayed time updates
      timelineUpdatesToSkip = 1;
      this.post('pause', 0);
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    this.seek = (time) => {
      this.post('seek', time);
      this.setCurrentTime(time);
      // Compensate for Echo360's delayed time updates
      timelineUpdatesToSkip = 1;
    };

    /**
     * Post a window message to the iframe.
     *
     * @public
     * @param event
     * @param data
     */
    this.post = (event, data) => {
      player?.contentWindow?.postMessage(
        JSON.stringify({
          event: event,
          context: 'Echo360',
          instanceId: instanceId,
          data: data
        }),
        '*'
      );
    };

    /**
     * Return the current play position.
     *
     * @public
     * @returns {Number} Seconds elapsed since beginning of video
     */
    this.getCurrentTime = () => {
      return currentTime;
    };

    /**
     * Set current time.
     * @param {number} timeS Time in seconds.
     */
    this.setCurrentTime = (timeS) => {
      currentTime = timeS;
    }

    /**
     * Return the video duration.
     *
     * @public
     * @returns {?Number} Video duration in seconds
     */
    this.getDuration = () => {
      if (duration > 0) {
        return duration;
      }
      return null;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    this.getBuffered = () => {
      return buffered;
    };

    /**
     * Mute the video.
     *
     * @public
     */
    this.mute = () => {
      this.post('mute', 0);
      isMuted = true;
    };

    /**
     * Unmute the video.
     *
     * @public
     */
    this.unMute = () => {
      this.post('unmute', 0);
      isMuted = false;
    };

    /**
     * Whether the video is muted.
     *
     * @public
     * @returns {Boolean} True if the video is muted, false otherwise
     */
    this.isMuted = () => {
      return isMuted;
    };

    /**
     * Get the video player's current sound volume.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    this.getVolume = () => {
      return volume;
    };

    /**
     * Set the video player's sound volume.
     *
     * @public
     * @param {Number} level
     */
    this.setVolume = (level) => {
      this.post('volume', level);
      volume = level;
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} Available playback rates
     */
    this.getPlaybackRates = () => {
      return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    };

    /**
     * Get the current playback rate.
     *
     * @public
     * @returns {Number} e.g. 0.5, 1, 1.5 or 2
     */
    this.getPlaybackRate = () => {
      return playbackRate;
    };

    /**
     * Set the current playback rate.
     *
     * @public
     * @param {Number} rate Must be one of available rates from getPlaybackRates
     */
    this.setPlaybackRate = async (rate) => {
      const echoRate = parseFloat(rate);
      this.post('playbackrate', echoRate);
      playbackRate = rate;
      this.trigger('playbackRateChange', rate);
    };

    /**
     * Set current captions track.
     *
     * @public
     * @param {H5P.Video.LabelValue} track Captions to display
     */
    this.setCaptionsTrack = (track) => {
      const echoCaption = trackOptions.find(
        (trackItem) => track?.value === trackItem.value
      );

      trackOptions.forEach(trackItem => {
        trackItem.mode = (trackItem === echoCaption) ? 'showing' : 'disabled';
      });

      this.post('captions', echoCaption ? echoCaption.value : 'off');
    };

    /**
     * Get current captions track.
     *
     * @public
     * @returns {H5P.Video.LabelValue|null} Current captions track.
     */
    this.getCaptionsTrack = () => {
      return trackOptions.find(
        (trackItem) => trackItem.mode === 'showing'
      ) ?? null;
    };

    this.on('resize', () => {
      if (failedLoading || !isNodeVisible(wrapperElement)) {
        return;
      }
      if (player === undefined) {
        // Player isn't created yet. Try again.
        createEchoPlayer();
        return;
      }
      // Use as much space as possible
      wrapperElement.style.cssText = 'width: 100%; height: 100%;';
      const width = wrapperElement.clientWidth;
      const height = options.fit ? wrapperElement.clientHeight : (width * (ratio));
      // Validate height before setting
      if (height > 0) {
        // Set size
        wrapperElement.style.cssText = 'width: ' + width + 'px; height: ' + height + 'px;';
      }
    });
  }

  /**
   * Find id of video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} Echo video identifier
   */
  const getId = (url) => {
    const matches = url.match(/^[^/]+:\/\/(echo360[^/]+)\/media\/([^/]+)\/h5p.*$/i);
    if (matches && matches.length === 3) {
      return [matches[2], matches[2]];
    }
  };

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  EchoPlayer.canPlay = (sources) => {
    return getId(sources[0].path);
  };
  return EchoPlayer;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoEchoVideo);
