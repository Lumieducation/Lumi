/** @namespace H5P */
H5P.VideoVimeo = (function ($) {

  let numInstances = 0;

  /**
   * Vimeo video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function VimeoPlayer(sources, options, l10n) {
    const self = this;

    let player;

    // Since all the methods of the Vimeo Player SDK are promise-based, we keep
    // track of all relevant state variables so that we can implement the
    // H5P.Video API where all methods return synchronously.
    let buffered = 0;
    let currentQuality;
    let currentTextTrack;
    let currentTime = 0;
    let duration = 0;
    let isMuted = 0;
    let volume = 0;
    let playbackRate = 1;
    let qualities = [];
    let loadingFailedTimeout;
    let failedLoading = false;
    let ratio = 9/16;
    let isLoaded = false;

    const LOADING_TIMEOUT_IN_SECONDS = 8;

    const id = `h5p-vimeo-${++numInstances}`;
    const $wrapper = $('<div/>');
    const $placeholder = $('<div/>', {
      id: id,
      html: `<div class="h5p-video-loading" style="height: 100%; min-height: 200px; display: block; z-index: 100;" aria-label="${l10n.loading}"></div>`
    }).appendTo($wrapper);

    /**
     * Create a new player with the Vimeo Player SDK.
     *
     * @private
     */
    const createVimeoPlayer = async () => {
      if (!$placeholder.is(':visible') || player !== undefined) {
        return;
      }

      // Since the SDK is loaded asynchronously below, explicitly set player to
      // null (unlike undefined) which indicates that creation has begun. This
      // allows the guard statement above to be hit if this function is called
      // more than once.
      player = null;

      const Vimeo = await loadVimeoPlayerSDK();

      const MIN_WIDTH = 200;
      const width = Math.max($wrapper.width(), MIN_WIDTH);

      const canHasControls = options.controls || self.pressToPlay;
      const embedOptions = {
        url: sources[0].path,
        controls: canHasControls,
        responsive: true,
        dnt: true,
        // Hardcoded autoplay to false to avoid playing videos on init
        autoplay: false,
        loop: options.loop ? true : false,
        playsinline: true,
        quality: 'auto',
        width: width,
        muted: false,
        keyboard: canHasControls,
      };

      // Create a new player
      player = new Vimeo.Player(id, embedOptions);

      registerVimeoPlayerEventListeneners(player);

      // Failsafe timeout to handle failed loading of videos.
      // This seems to happen for private videos even though the SDK docs
      // suggests to catch PrivacyError when attempting play()
      loadingFailedTimeout = setTimeout(() => {
        failedLoading = true;
        removeLoadingIndicator();
        $wrapper.html(`<p class="vimeo-failed-loading">${l10n.vimeoLoadingError}</p>`);
        $wrapper.css({
          width: null,
          height: null
        });
        self.trigger('resize');
        self.trigger('error', l10n.vimeoLoadingError);
      }, LOADING_TIMEOUT_IN_SECONDS * 1000);
    }

    const removeLoadingIndicator = () => {
      $placeholder.find('div.h5p-video-loading').remove();
    };

    /**
     * Register event listeners on the given Vimeo player.
     *
     * @private
     * @param {Vimeo.Player} player
     */
    const registerVimeoPlayerEventListeneners = (player) => {
      let isFirstPlay, tracks;
      player.on('loaded', async () => {
        isFirstPlay = true;
        isLoaded = true;
        clearTimeout(loadingFailedTimeout);

        const videoDetails = await getVimeoVideoMetadata(player);
        tracks = videoDetails.tracks.options;
        currentTextTrack = tracks.current;
        duration = videoDetails.duration;
        qualities = videoDetails.qualities;
        currentQuality = 'auto';
        try {
          ratio = videoDetails.dimensions.height / videoDetails.dimensions.width;
        }
        catch (e) { /* Intentionally ignore this, and fallback on the default ratio */ }

        removeLoadingIndicator();

        if (options.startAt) {
          // Vimeo.Player doesn't have an option for setting start time upon
          // instantiation, so we instead perform an initial seek here.
          currentTime = await self.seek(options.startAt);
        }

        self.trigger('ready');
        self.trigger('loaded');
        self.trigger('qualityChange', currentQuality);
        self.trigger('resize');
      });

      player.on('play', () => {
        if (isFirstPlay) {
          isFirstPlay = false;
          if (tracks.length) {
            self.trigger('captions', tracks);
          }
        }
      });

      // Handle playback state changes.
      player.on('playing', () => self.trigger('stateChange', H5P.Video.PLAYING));
      player.on('pause', () => self.trigger('stateChange', H5P.Video.PAUSED));
      player.on('ended', () => self.trigger('stateChange', H5P.Video.ENDED));

      // Track the percentage of video that has finished loading (buffered).
      player.on('progress', (data) => {
        buffered = data.percent * 100;
      });

      // Track the current time. The update frequency may be browser-dependent,
      // according to the official docs:
      // https://developer.vimeo.com/player/sdk/reference#timeupdate
      player.on('timeupdate', (time) => {
        currentTime = time.seconds;
      });
    };

    /**
     * Get metadata about the video loaded in the given Vimeo player.
     *
     * Example resolved value:
     *
     * ```
     * {
     *   "duration": 39,
     *   "qualities": [
     *     {
     *       "name": "auto",
     *       "label": "Auto"
     *     },
     *     {
     *       "name": "1080p",
     *       "label": "1080p"
     *     },
     *     {
     *       "name": "720p",
     *       "label": "720p"
     *     }
     *   ],
     *   "dimensions": {
     *     "width": 1920,
     *     "height": 1080
     *   },
     *   "tracks": {
     *     "current": {
     *       "label": "English",
     *       "value": "en"
     *     },
     *     "options": [
     *       {
     *         "label": "English",
     *         "value": "en"
     *       },
     *       {
     *         "label": "Norsk bokmål",
     *         "value": "nb"
     *       }
     *     ]
     *   }
     * }
     * ```
     *
     * @private
     * @param {Vimeo.Player} player
     * @returns {Promise}
     */
    const getVimeoVideoMetadata = (player) => {
      // Create an object for easy lookup of relevant metadata
      const massageVideoMetadata = (data) => {
        const duration = data[0];
        const qualities = data[1].map(q => ({
          name: q.id,
          label: q.label
        }));
        const tracks = data[2].reduce((tracks, current) => {
          const h5pVideoTrack = new H5P.Video.LabelValue(current.label, current.language);
          tracks.options.push(h5pVideoTrack);
          if (current.mode === 'showing') {
            tracks.current = h5pVideoTrack;
          }
          return tracks;
        }, { current: undefined, options: [] });
        const dimensions = { width: data[3], height: data[4] };

        return {
          duration,
          qualities,
          tracks,
          dimensions
        };
      };

      return Promise.all([
        player.getDuration(),
        player.getQualities(),
        player.getTextTracks(),
        player.getVideoWidth(),
        player.getVideoHeight(),
      ]).then(data => massageVideoMetadata(data));
    }

    try {
      if (document.featurePolicy.allowsFeature('autoplay') === false) {
        self.pressToPlay = true;
      }
    }
    catch (err) {}

    /**
     * Appends the video player to the DOM.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = ($container) => {
      $container.addClass('h5p-vimeo').append($wrapper);
      createVimeoPlayer();
    };

    /**
     * Get list of available qualities.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = () => {
      return qualities;
    };

    /**
     * Get the current quality.
     *
     * @returns {String} Current quality identifier
     */
    self.getQuality = () => {
      return currentQuality;
    };

    /**
     * Set the playback quality.
     *
     * @public
     * @param {String} quality
     */
    self.setQuality = async (quality) => {
      currentQuality = await player.setQuality(quality);
      self.trigger('qualityChange', currentQuality);
    };

    /**
     * Start the video.
     *
     * @public
     */
    self.play = async () => {
      if (!player) {
        self.on('ready', self.play);
        return;
      }

      try {
        await player.play();
      }
      catch (error) {
        switch (error.name) {
          case 'PasswordError': // The video is password-protected
            self.trigger('error', l10n.vimeoPasswordError);
            break;

          case 'PrivacyError': // The video is private
            self.trigger('error', l10n.vimeoPrivacyError);
            break;

          default:
            self.trigger('error', l10n.unknownError);
            break;
        }
      }
    };

    /**
     * Pause the video.
     *
     * @public
     */
    self.pause = () => {
      if (player) {
        player.pause();
      }
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = async (time) => {
      if (!player) {
        return;
      }

      currentTime = time;
      await player.setCurrentTime(time);
    };

    /**
     * @public
     * @returns {Number} Seconds elapsed since beginning of video
     */
    self.getCurrentTime = () => {
      return currentTime;
    };

    /**
     * @public
     * @returns {Number} Video duration in seconds
     */
    self.getDuration = () => {
      return duration;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = () => {
      return buffered;
    };

    /**
     * Mute the video.
     *
     * @public
     */
    self.mute = async () => {
      isMuted = await player.setMuted(true);
    };

    /**
     * Unmute the video.
     *
     * @public
     */
    self.unMute = async () => {
      isMuted = await player.setMuted(false);
    };

    /**
     * Whether the video is muted.
     *
     * @public
     * @returns {Boolean} True if the video is muted, false otherwise
     */
    self.isMuted = () => {
      return isMuted;
    };

    /**
     * Whether the video is loaded.
     *
     * @public
     * @returns {Boolean} True if the video is muted, false otherwise
     */
    self.isLoaded = () => {
      return isLoaded;
    };

    /**
     * Get the video player's current sound volume.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = () => {
      return volume;
    };

    /**
     * Set the video player's sound volume.
     *
     * @public
     * @param {Number} level
     */
    self.setVolume = async (level) => {
      volume = await player.setVolume(level);
    };

    /**
     * Get list of available playback rates.
     *
     * @public
     * @returns {Array} Available playback rates
     */
    self.getPlaybackRates = () => {
      return [0.5, 1, 1.5, 2];
    };

    /**
     * Get the current playback rate.
     *
     * @public
     * @returns {Number} e.g. 0.5, 1, 1.5 or 2
     */
    self.getPlaybackRate = () => {
      return playbackRate;
    };

    /**
     * Set the current playback rate.
     *
     * @public
     * @param {Number} rate Must be one of available rates from getPlaybackRates
     */
    self.setPlaybackRate = async (rate) => {
      playbackRate = await player.setPlaybackRate(rate);
      self.trigger('playbackRateChange', rate);
    };

    /**
     * Set current captions track.
     *
     * @public
     * @param {H5P.Video.LabelValue} track Captions to display
     */
    self.setCaptionsTrack = (track) => {
      if (!track) {
        return player.disableTextTrack().then(() => {
          currentTextTrack = null;
        });
      }

      player.enableTextTrack(track.value).then(() => {
        currentTextTrack = track;
      });
    };

    /**
     * Get current captions track.
     *
     * @public
     * @returns {H5P.Video.LabelValue}
     */
    self.getCaptionsTrack = () => {
      return currentTextTrack;
    };

    self.on('resize', () => {
      if (failedLoading || !$wrapper.is(':visible')) {
        return;
      }

      if (player === undefined) {
        // Player isn't created yet. Try again.
        createVimeoPlayer();
        return;
      }

      // Use as much space as possible
      $wrapper.css({
        width: '100%',
        height: 'auto'
      });

      const width = $wrapper[0].clientWidth;
      const height = options.fit ? $wrapper[0].clientHeight : (width * (ratio));

      // Validate height before setting
      if (height > 0) {
        // Set size
        $wrapper.css({
          width: width + 'px',
          height: height + 'px'
        });
      }
    });
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  VimeoPlayer.canPlay = (sources) => {
    return getId(sources[0].path);
  };

  /**
   * Find id of Vimeo video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} Vimeo video ID
   */
  const getId = (url) => {
    // https://stackoverflow.com/a/11660798
    const matches = url.match(/^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/);
    if (matches && matches[5]) {
      return matches[5];
    }
  };

  /**
   * Load the Vimeo Player SDK asynchronously.
   *
   * @private
   * @returns {Promise} Vimeo Player SDK object
   */
  const loadVimeoPlayerSDK = async () => {
    if (window.Vimeo) {
      return await Promise.resolve(window.Vimeo);
    }

    return await new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = 'https://player.vimeo.com/api/player.js';
      tag.onload = () => resolve(window.Vimeo);
      tag.onerror = reject;
      document.querySelector('script').before(tag);
    });
  };

  return VimeoPlayer;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoVimeo);
