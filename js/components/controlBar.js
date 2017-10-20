/********************************************************************
  CONTROL BAR
*********************************************************************/
var React = require('react'),
    ReactDOM = require('react-dom'),
    CONSTANTS = require('../constants/constants'),
    ClassNames = require('classnames'),
    ScrubberBar = require('./scrubberBar'),
    Slider = require('./slider'),
    Utils = require('./utils'),
    Popover = require('../views/popover'),
    VideoQualityPanel = require('./videoQualityPanel'),
    ClosedCaptionPopover = require('./closed-caption/closedCaptionPopover'),
    Logo = require('./logo'),
    Icon = require('./icon');

var ControlBar = React.createClass({
  getInitialState: function() {
    this.isMobile = this.props.controller.state.isMobile;
    this.responsiveUIMultiple = this.getResponsiveUIMultiple(this.props.responsiveView);
    this.volumeSliderValue = 0;
    this.moreOptionsItems = null;

    return {
      currentVolumeHead: 0
    };
  },

  componentDidMount: function() {
    window.addEventListener('orientationchange', this.closePopovers);

    // the selector should be more specific ... what if more than one video player
    this.props.controller.actualVideoObject = document.querySelector('video');
  },

  componentWillReceiveProps: function(nextProps) {
    // if responsive breakpoint changes
    if (nextProps.responsiveView != this.props.responsiveView) {
      this.responsiveUIMultiple = this.getResponsiveUIMultiple(nextProps.responsiveView);
    }
  },

  componentWillUnmount: function () {
    this.props.controller.cancelTimer();
    this.closePopovers();
    if (Utils.isAndroid()){
      this.props.controller.hideVolumeSliderBar();
    }
    window.removeEventListener('orientationchange', this.closePopovers);
  },

  getResponsiveUIMultiple: function(responsiveView){
    var multiplier = this.props.skinConfig.responsive.breakpoints[responsiveView].multiplier;
    return multiplier;
  },

  handleControlBarMouseUp: function(evt) {
    if (evt.type == 'touchend' || !this.isMobile){
      evt.stopPropagation(); // W3C
      evt.cancelBubble = true; // IE
      this.props.controller.state.accessibilityControlsEnabled = true;
      this.props.controller.startHideControlBarTimer();
    }
  },

  handleFullscreenClick: function(evt) {
    // On mobile, we get a following click event that fires after the Video
    // has gone full screen, clicking on a different UI element. So we prevent
    // the following click.
    evt.stopPropagation();
    evt.cancelBubble = true;
    evt.preventDefault();
    this.props.controller.toggleFullscreen();
  },

  handleLiveClick: function(evt) {
    evt.stopPropagation();
    evt.cancelBubble = true;
    evt.preventDefault();
    this.props.controller.onLiveClick();
    this.props.controller.seek(this.props.duration);
  },

  handleVolumeIconClick: function(evt) {
    if (this.isMobile){
      this.props.controller.startHideControlBarTimer();
      evt.stopPropagation(); // W3C
      evt.cancelBubble = true; // IE
      if (!this.props.controller.state.volumeState.volumeSliderVisible){
        this.props.controller.showVolumeSliderBar();
      }
      else {
        this.props.controller.handleMuteClick();
      }
    }
    else{
      this.props.controller.handleMuteClick();
    }
  },

  /**
   * Some browsers give focus to buttons after click, which leaves
   * them highlighted. This overrides the browser's default behavior.
   *
   * @param {event} evt The mouse up event object
   */
  blurOnMouseUp: function(evt) {
    if (evt.currentTarget) {
      evt.currentTarget.blur();
    }
  },

  handlePlayClick: function() {
    this.props.controller.togglePlayPause();
  },

  handleShareClick: function() {
    this.props.controller.toggleShareScreen();
  },

  handleQualityClick: function() {
    if(this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.xs.id) {
      this.props.controller.toggleScreen(CONSTANTS.SCREEN.VIDEO_QUALITY_SCREEN);
    } else {
      this.toggleQualityPopover();
      this.closeCaptionPopover();
    }
  },

  toggleQualityPopover: function() {
    this.props.controller.toggleVideoQualityPopOver();
  },

  closeQualityPopover: function() {
    if(this.props.controller.state.videoQualityOptions.showVideoQualityPopover == true) {
      this.toggleQualityPopover();
    }
  },

  toggleCaptionPopover: function() {
    this.props.controller.toggleClosedCaptionPopOver();
  },

  closeCaptionPopover: function() {
    if(this.props.controller.state.closedCaptionOptions.showClosedCaptionPopover == true) {
      this.toggleCaptionPopover();
    }
  },

  closePopovers: function() {
    this.closeCaptionPopover();
    this.closeQualityPopover();
  },

  handleVolumeClick: function(evt) {
    evt.preventDefault();
    var newVolume = parseFloat(evt.target.dataset.volume);
    this.props.controller.setVolume(newVolume);
  },

  handleDiscoveryClick: function() {
    this.props.controller.toggleDiscoveryScreen();
  },

  handleMoreOptionsClick: function() {
    this.props.controller.toggleMoreOptionsScreen(this.moreOptionsItems);
  },

  handleClosedCaptionClick: function() {
    if(this.props.responsiveView == this.props.skinConfig.responsive.breakpoints.xs.id) {
      this.props.controller.toggleScreen(CONSTANTS.SCREEN.CLOSEDCAPTION_SCREEN);
    } else {
      this.toggleCaptionPopover();
      this.closeQualityPopover();
    }
  },

  handlePlayPauseFocus: function() {
    this.props.controller.state.playPauseButtonFocused = true;
  },

  handlePlayPauseBlur: function() {
    this.props.controller.state.playPauseButtonFocused = false;
  },

  handleStepForwardClick: function() {
    this.props.controller.step(+1);
  },

  handleStepBackClick: function() {
    this.props.controller.step(-1);
  },

  handleSlowMoOneHalfClick: function() {
    this.props.controller.slowMoOneHalf();
  },

  handleSlowMoOneThirdClick: function() {
    this.props.controller.slowMoOneThird();
  },

  handleSkipBackClick: function() {
    this.props.controller.skipBack(10);
  },

  //TODO(dustin) revisit this, doesn't feel like the "react" way to do this.
  highlight: function(evt) {
    var iconElement = Utils.getEventIconElement(evt);
    if (iconElement) {
      var color = this.props.skinConfig.controlBar.iconStyle.active.color ? this.props.skinConfig.controlBar.iconStyle.active.color : this.props.skinConfig.general.accentColor;
      var opacity = this.props.skinConfig.controlBar.iconStyle.active.opacity;
      Utils.highlight(iconElement, opacity, color);
    }
  },

  removeHighlight: function(evt) {
    var iconElement = Utils.getEventIconElement(evt);
    if (iconElement) {
      var color = this.props.skinConfig.controlBar.iconStyle.inactive.color;
      var opacity = this.props.skinConfig.controlBar.iconStyle.inactive.opacity;
      Utils.removeHighlight(iconElement, opacity, color);
    }
  },

  changeVolumeSlider: function(event) {
    var newVolume = parseFloat(event.target.value);
    this.props.controller.setVolume(newVolume);
    this.setState({
      volumeSliderValue: event.target.value
    });
  },

  populateControlBar: function() {
    var dynamicStyles = this.setupItemStyle();
    var playIcon, playPauseAriaLabel;
    if (this.props.playerState == CONSTANTS.STATE.PLAYING) {
      playIcon = "pause";
      playPauseAriaLabel = CONSTANTS.ARIA_LABELS.PAUSE;
    } else if (this.props.playerState == CONSTANTS.STATE.END) {
      playIcon = "replay";
      playPauseAriaLabel = CONSTANTS.ARIA_LABELS.REPLAY;
    } else {
      playIcon = "play";
      playPauseAriaLabel = CONSTANTS.ARIA_LABELS.PLAY;
    }

    var volumeIcon, volumeAriaLabel;
    if (this.props.controller.state.volumeState.muted) {
      volumeIcon = "volumeOff";
      volumeAriaLabel = CONSTANTS.ARIA_LABELS.UNMUTE;
    } else {
      volumeIcon = "volume";
      volumeAriaLabel = CONSTANTS.ARIA_LABELS.MUTE;
    }

    var fullscreenIcon, fullscreenAriaLabel;
    if (this.props.controller.state.fullscreen) {
      fullscreenIcon = "compress";
      fullscreenAriaLabel = CONSTANTS.ARIA_LABELS.EXIT_FULLSCREEN;
    } else {
      fullscreenIcon = "expand";
      fullscreenAriaLabel = CONSTANTS.ARIA_LABELS.FULLSCREEN;
    }

    var totalTime = 0;
    if (this.props.duration == null || typeof this.props.duration == 'undefined' || this.props.duration == ""){
      totalTime = Utils.formatSeconds(0);
    }
    else {
      totalTime = Utils.formatSeconds(this.props.duration);
    }

    var volumeBars = [];
    for (var i=0; i<10; i++) {
      //create each volume tick separately
      var turnedOn = this.props.controller.state.volumeState.volume >= (i+1) / 10;
      var volumeClass = ClassNames({
        "oo-volume-bar": true,
        "oo-on": turnedOn
      });
      var barStyle = {backgroundColor: this.props.skinConfig.controlBar.volumeControl.color ? this.props.skinConfig.controlBar.volumeControl.color : this.props.skinConfig.general.accentColor};

      volumeBars.push(<a data-volume={(i+1)/10} className={volumeClass} key={i}
        style={barStyle}
        onClick={this.handleVolumeClick}
        aria-hidden="true"></a>);
    }

    var volumeSlider = <div className="oo-volume-slider"><Slider value={parseFloat(this.props.controller.state.volumeState.volume)}
                        onChange={this.changeVolumeSlider}
                        className={"oo-slider oo-slider-volume"}
                        itemRef={"volumeSlider"}
                        minValue={"0"}
                        maxValue={"1"}
                        step={"0.1"}/></div>;

    var volumeControls;
    if (!this.isMobile){
      volumeControls = volumeBars;
    }
    else {
      volumeControls = this.props.controller.state.volumeState.volumeSliderVisible ? volumeSlider : null;
    }
    // force the volume slider to display; instead of volume bars
    this.props.controller.state.volumeState.volumeSliderVisible = true;
    volumeControls = this.props.controller.state.volumeState.volumeSliderVisible ? volumeSlider : null;

    var playheadTime = isFinite(parseInt(this.props.currentPlayhead)) ? Utils.formatSeconds(parseInt(this.props.currentPlayhead)) : null;
    var isLiveStream = this.props.isLiveStream;
    var durationSetting = {color: this.props.skinConfig.controlBar.iconStyle.inactive.color};
    var timeShift = this.props.currentPlayhead - this.props.duration;
    // checking timeShift < 1 seconds (not == 0) as processing of the click after we rewinded and then went live may take some time
    var isLiveNow = Math.abs(timeShift) < 1;
    var liveClick = isLiveNow ? null : this.handleLiveClick;
    var playheadTimeContent = isLiveStream ? (isLiveNow ? null : Utils.formatSeconds(timeShift)) : playheadTime;
    var totalTimeContent = isLiveStream ? null : <span className="oo-total-time">{totalTime}</span>;

    // TODO: Update when implementing localization
    var liveText = Utils.getLocalizedString(this.props.language, CONSTANTS.SKIN_TEXT.LIVE, this.props.localizableStrings);

    var liveClass = ClassNames({
      "oo-control-bar-item oo-live oo-live-indicator": true,
      "oo-live-nonclickable": isLiveNow
    });

    var videoQualityPopover = this.props.controller.state.videoQualityOptions.showVideoQualityPopover ? <Popover><VideoQualityPanel{...this.props} togglePopoverAction={this.toggleQualityPopover} popover={true}/></Popover> : null;
    var closedCaptionPopover = this.props.controller.state.closedCaptionOptions.showClosedCaptionPopover ? <Popover popoverClassName="oo-popover oo-popover-pull-right"><ClosedCaptionPopover {...this.props} togglePopoverAction={this.toggleCaptionPopover}/></Popover> : null;

    var qualityClass = ClassNames({
      "oo-quality": true,
      "oo-control-bar-item": true,
      "oo-selected": this.props.controller.state.videoQualityOptions.showVideoQualityPopover
    });

    var captionClass = ClassNames({
      "oo-closed-caption": true,
      "oo-control-bar-item": true,
      "oo-selected": this.props.controller.state.closedCaptionOptions.showClosedCaptionPopover
    });

    var slowMoOneHalfClass = ClassNames({
      "oo-slow-mo__button": true,
      "oo-slow-mo__button--one-half": true,
      "oo-slow-mo__button--active": this.props.controller.state.slowMoOneHalfActive
    });

    var slowMoOneThirdClass = ClassNames({
      "oo-slow-mo__button": true,
      "oo-slow-mo__button--one-third": true,
      "oo-slow-mo__button--active": this.props.controller.state.slowMoOneThirdActive
    });

    var selectedStyle = {};
    selectedStyle["color"] = this.props.skinConfig.general.accentColor ? this.props.skinConfig.general.accentColor : null;

    var controlItemTemplates = {
      "playPause": <button className="oo-play-pause oo-control-bar-item"
        onClick={this.handlePlayClick}
        onMouseUp={this.blurOnMouseUp}
        onMouseOver={this.highlight}
        onMouseOut={this.removeHighlight}
        onFocus={this.handlePlayPauseFocus}
        onBlur={this.handlePlayPauseBlur}
        key="playPause"
        tabIndex="0"
        aria-label={playPauseAriaLabel}
        autoFocus={this.props.controller.state.playPauseButtonFocused}>
        <Icon {...this.props} icon={playIcon} style={dynamicStyles.iconCharacter} />
      </button>,

      "live": <a className={liveClass}
        ref="LiveButton"
        onClick={liveClick} key="live">
        <div className="oo-live-circle"></div>
        <span className="oo-live-text">{liveText}</span>
      </a>,

      "volume": <div className="oo-volume oo-control-bar-item" key="volume">
        <button className="oo-mute-unmute oo-control-bar-item"
          onClick={this.handleVolumeIconClick}
          onMouseUp={this.blurOnMouseUp}
          onMouseOver={this.highlight}
          onMouseOut={this.removeHighlight}
          tabIndex="0"
          aria-label={volumeAriaLabel}>
          <Icon {...this.props} icon={volumeIcon} ref="volumeIcon"
            style={this.props.skinConfig.controlBar.iconStyle.inactive} />
        </button>
        {volumeControls}
      </div>,

      "timeDuration": <a className="oo-time-duration oo-control-bar-duration" style={durationSetting} key="timeDuration">
        <span>{playheadTimeContent}</span>{totalTimeContent}
      </a>,

      "flexibleSpace": <div className="oo-flexible-space oo-control-bar-flex-space" key="flexibleSpace"></div>,

      "moreOptions": <a className="oo-more-options oo-control-bar-item"
        onClick={this.handleMoreOptionsClick} key="moreOptions" aria-hidden="true">
        <Icon {...this.props} icon="ellipsis" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "quality": (
        <div className="oo-popover-button-container" key="quality">
          {videoQualityPopover}
          <a className={qualityClass} onClick={this.handleQualityClick} style={selectedStyle} aria-hidden="true">
            <Icon {...this.props} icon="quality" style={dynamicStyles.iconCharacter}
              onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
          </a>
        </div>
      ),

      "discovery": <a className="oo-discovery oo-control-bar-item"
        onClick={this.handleDiscoveryClick} key="discovery" aria-hidden="true">
        <Icon {...this.props} icon="discovery" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "closedCaption": (
        <div className="oo-popover-button-container" key="closedCaption">
          {closedCaptionPopover}
          <a className={captionClass} onClick={this.handleClosedCaptionClick} style={selectedStyle} aria-hidden="true">
            <Icon {...this.props} icon="cc" style={dynamicStyles.iconCharacter}
              onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
          </a>
        </div>
      ),

      "share": <a className="oo-share oo-control-bar-item"
        onClick={this.handleShareClick} key="share" aria-hidden="true">
        <Icon {...this.props} icon="share" style={dynamicStyles.iconCharacter}
          onMouseOver={this.highlight} onMouseOut={this.removeHighlight}/>
      </a>,

      "fullscreen": <button className="oo-fullscreen oo-control-bar-item"
        onClick={this.handleFullscreenClick}
        onMouseUp={this.blurOnMouseUp}
        onMouseOver={this.highlight}
        onMouseOut={this.removeHighlight}
        key="fullscreen"
        tabIndex="0"
        aria-label={fullscreenAriaLabel}>
        <Icon {...this.props} icon={fullscreenIcon} style={dynamicStyles.iconCharacter} />
      </button>,

      "logo": <Logo key="logo" imageUrl={this.props.skinConfig.controlBar.logo.imageResource.url}
        clickUrl={this.props.skinConfig.controlBar.logo.clickUrl}
        target={this.props.skinConfig.controlBar.logo.target}
        width={this.props.responsiveView != this.props.skinConfig.responsive.breakpoints.xs.id ? this.props.skinConfig.controlBar.logo.width : null}
        height={this.props.skinConfig.controlBar.logo.height}/>,

      "advancedSeeking": <div className="oo-advanced-seeking oo-control-bar-item" key="advancedSeeking">
                          <div className="oo-frame-by-frame oo-control-bar-item">
                            <button
                              onClick={this.handleStepBackClick}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <g fill="#ffffff" fillRule="evenodd">
                                <g transform="rotate(-180 9 9)">
                                  <path d="M0,12 L4,8 L0,12 Z"/>
                                  <polygon points=".01 0 0 .009 0 3.893 4.102 8 0 12.108 0 15.991 .01 16 8 8"/>
                                </g>
                                <g transform="rotate(-180 5 9)">
                                  <path d="M0,12 L4,8 L0,12 Z"/>
                                  <polygon points=".01 0 0 .009 0 3.893 4.102 8 0 12.108 0 15.991 .01 16 8 8"/>
                                </g>
                              </g>
                            </svg>
                            </button>
                            <button
                              onClick={this.handleStepForwardClick}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <g fill="#ffffff" fillRule="evenodd">
                                <g transform="translate(10 2)">
                                  <path d="M0,12 L4,8 L0,12 Z"/>
                                  <polygon points=".01 0 0 .009 0 3.893 4.102 8 0 12.108 0 15.991 .01 16 8 8"/>
                                </g>
                                <g transform="translate(2 2)">
                                  <path d="M0,12 L4,8 L0,12 Z"/>
                                  <polygon points=".01 0 0 .009 0 3.893 4.102 8 0 12.108 0 15.991 .01 16 8 8"/>
                                </g>
                              </g>
                            </svg>
                            </button>
                          </div>
                          <div className="oo-skip-back oo-control-bar-item">
                            <button
                              onClick={this.handleSkipBackClick}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20">
                              <g fill="#ffffff" fillRule="evenodd">
                                <g transform="rotate(90 9.5 10)">
                                  <path d="M5.15695577,13.4643646 C6.61685204,15.0247827 8.69453892,16 11,16 C15.418278,16 19,12.418278 19,8 C19,3.581722 15.418278,0 11,0 C6.581722,0 3,3.581722 3,8 C3,9.00559942 3.18553926,9.96786382 3.52425212,10.8544275 L5.13009451,9.24858515 C5.04484514,8.84582486 5,8.4281495 5,8 C5,4.6862915 7.6862915,2 11,2 C14.3137085,2 17,4.6862915 17,8 C17,11.3137085 14.3137085,14 11,14 C9.24681241,14 7.66924905,13.2480632 6.57222027,12.0491001 L5.15695577,13.4643646 Z"/>
                                  <path d="M2.57190958,7.36396103 L3.24185123e-14,7.36396103 L4,11.363961 L8,7.36396103 L5.42809042,7.36396103 L4,8.79205145 L2.57190958,7.36396103 Z"/>
                                </g>
                                <text fontFamily="ProximaNova-Bold, Proxima Nova" fontSize="7" fontWeight="bold">
                                  <tspan x="7.891" y="14">10</tspan>
                                </text>
                              </g>
                            </svg>
                            </button>
                          </div>
                          <div className="oo-slow-mo oo-control-bar-item">
                            <button
                              className={slowMoOneHalfClass}
                              onClick={this.handleSlowMoOneHalfClick}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <g fill="#ffffff" fillRule="evenodd">
                                <path fillRule="nonzero" d="M16.3540376,8.89816107 L17.3666646,9.57003893 L17.3670216,10.4595393 L16.3549343,11.1328606 L6,4.2623638 L6,3.26676196 L6.83183724,2.58018312 L7.50053074,3.02386111 L7.50053074,17.0235167 L6.83040069,17.4693407 L6,16.7847663 L6,15.7864935 L16.3540376,8.89816107 Z M6,18.0217896 L6,2.02825928 L18.0362549,10.0143119 L6,18.0217896 Z"/>
                                <rect width="2" height="16" x="2" y="2"/>
                              </g>
                            </svg>
                            </button>
                            <button
                              className={slowMoOneThirdClass}
                              onClick={this.handleSlowMoOneThirdClick}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                              <g fill="#ffffff" fillRule="evenodd">
                                <path fillRule="nonzero" d="M16.6528124,8.89816107 L17.485589,9.57003893 L17.4858826,10.4595393 L16.6535498,11.1328606 L8.13773191,4.2623638 L8.13773191,3.26676196 L8.82182843,2.58018312 L9.37175679,3.02386111 L9.37175679,17.0235167 L8.82064702,17.4693407 L8.13773191,16.7847663 L8.13773191,15.7864935 L16.6528124,8.89816107 Z M8.13773191,18.0217896 L8.13773191,2.02825928 L18.0362549,10.0143119 L8.13773191,18.0217896 Z"/>
                                <rect width="2" height="16" x="5" y="2"/>
                                <rect width="2" height="16" x="2" y="2"/>
                              </g>
                            </svg>
                            </button>
                          </div>
                        </div>
    };

    var controlBarItems = [];
    var defaultItems = this.props.controller.state.isPlayingAd ? this.props.skinConfig.buttons.desktopAd : this.props.skinConfig.buttons.desktopContent;

    //if mobile and not showing the slider or the icon, extra space can be added to control bar width. If volume bar is shown instead of slider, add some space as well:
    var volumeItem = null;
    var extraSpaceVolume = 0;

    for (var j = 0; j < defaultItems.length; j++) {
      if (defaultItems[j].name == "volume") {
        volumeItem = defaultItems[j];

        var extraSpaceVolumeSlider = (((volumeItem && this.isMobile && !this.props.controller.state.volumeState.volumeSliderVisible) || volumeItem && Utils.isIos()) ? parseInt(volumeItem.minWidth) : 0);
        var extraSpaceVolumeBar = this.isMobile ? 0 : parseInt(volumeItem.minWidth)/2;
        extraSpaceVolume = extraSpaceVolumeSlider + extraSpaceVolumeBar;

        break;
      }
    }


    //if no hours, add extra space to control bar width:
    var hours = parseInt(this.props.duration / 3600, 10);
    var extraSpaceDuration = (hours > 0) ? 0 : 45;

    var controlBarLeftRightPadding = CONSTANTS.UI.DEFAULT_SCRUBBERBAR_LEFT_RIGHT_PADDING * 2;

    for (var k = 0; k < defaultItems.length; k++) {

      //filter out unrecognized button names
      if (typeof controlItemTemplates[defaultItems[k].name] === "undefined") {
        continue;
      }

      //filter out disabled buttons
      if (defaultItems[k].location === "none") {
        continue;
      }

      //do not show share button if not share options are available
      if (defaultItems[k].name === "share") {
        var shareContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.shareContent', []);
        var socialContent = Utils.getPropertyValue(this.props.skinConfig, 'shareScreen.socialContent', []);
        var onlySocialTab = shareContent.length === 1 && shareContent[0] === 'social';
        //skip if no tabs were specified or if only the social tab is present but no social buttons are specified
        if (this.props.controller.state.isOoyalaAds || !shareContent.length || (onlySocialTab && !socialContent.length)) {
          continue;
        }
      }

      //do not show CC button if no CC available
      if ((this.props.controller.state.isOoyalaAds || !this.props.controller.state.closedCaptionOptions.availableLanguages) && (defaultItems[k].name === "closedCaption")){
        continue;
      }

      //do not show quality button if no bitrates available
      if ((this.props.controller.state.isOoyalaAds || !this.props.controller.state.videoQualityOptions.availableBitrates) && (defaultItems[k].name === "quality")){
        continue;
      }

      //do not show discovery button if no related videos available
      if ((this.props.controller.state.isOoyalaAds || !this.props.controller.state.discoveryData) && (defaultItems[k].name === "discovery")){
        continue;
      }

      //do not show logo if no image url available
      if (!this.props.skinConfig.controlBar.logo.imageResource.url && (defaultItems[k].name === "logo")){
        continue;
      }

      if (Utils.isIos() && (defaultItems[k].name === "volume")){
        continue;
      }

      //not sure what to do when there are multi streams
      if (defaultItems[k].name === "live" &&
        (typeof this.props.isLiveStream === 'undefined' ||
        !(this.props.isLiveStream))) {
        continue;
      }

      controlBarItems.push(defaultItems[k]);
    }

    var collapsedResult = Utils.collapse(this.props.componentWidth + this.responsiveUIMultiple * (extraSpaceDuration + extraSpaceVolume - controlBarLeftRightPadding), controlBarItems, this.responsiveUIMultiple);
    var collapsedControlBarItems = collapsedResult.fit;
    var collapsedMoreOptionsItems = collapsedResult.overflow;
    this.moreOptionsItems = collapsedMoreOptionsItems;

    finalControlBarItems = [];

    for (var k = 0; k < collapsedControlBarItems.length; k++) {
      if (collapsedControlBarItems[k].name === "moreOptions" && (this.props.controller.state.isOoyalaAds || collapsedMoreOptionsItems.length === 0)) {
        continue;
      }

      finalControlBarItems.push(controlItemTemplates[collapsedControlBarItems[k].name]);
    }

    return finalControlBarItems;
  },

  setupItemStyle: function() {
    var returnStyles = {};

    returnStyles.iconCharacter = {
      color: this.props.skinConfig.controlBar.iconStyle.inactive.color,
      opacity: this.props.skinConfig.controlBar.iconStyle.inactive.opacity

    };
    return returnStyles;
  },


  render: function() {
    var controlBarClass = ClassNames({
      "oo-control-bar": true,
      // TODO-TEMP was !this.props.controlBarVisible ... set to false when DEVing
      "oo-control-bar-hidden": !this.props.controlBarVisible
    });

    var controlBarItems = this.populateControlBar();

    var controlBarStyle = {
      height: this.props.skinConfig.controlBar.height
    };

    return (
      <div className={controlBarClass} style={controlBarStyle} onMouseUp={this.handleControlBarMouseUp} onTouchEnd={this.handleControlBarMouseUp}>
        <ScrubberBar {...this.props} />

        <div className="oo-control-bar-items-wrapper">
          {controlBarItems}
        </div>
      </div>
    );
  }
});

ControlBar.defaultProps = {
  isLiveStream: false,
  skinConfig: {
    responsive: {
      breakpoints: {
        xs: {id: 'xs'},
        sm: {id: 'sm'},
        md: {id: 'md'},
        lg: {id: 'lg'}
      }
    }
  },
  responsiveView: 'md'
};

module.exports = ControlBar;
