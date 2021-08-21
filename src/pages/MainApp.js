import { Div, ThemeProvider } from "atomize";
import { AnimatePresence, motion } from "framer-motion";
import ParticlesBg from "particles-bg";
import React, { Component } from "react";
import Lottie from "react-lottie-player";
import { connect } from "react-redux";
import TextTransition, { presets } from "react-text-transition";
import spotifyLogo1 from "../animations/spotifyLogo1.json";
// import dancingMan from "../animations/dancingMan.json";
import { spotifyFlaskBaseAPI } from "../api/bundle";
import { introContainer, particleBg } from "../themes/MainApp";
import "../themes/MainApp.css";
import { defaultTheme } from "../themes/Spotify";

export class MainApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spotifyName: null,
      spotifyData: null,
      isIdentified: false,
      isLoading: true,
      //TODO: Abstract away to MsgTransitionComponent or Fragment
      introMsgs: ["Hello"],
      introMsg: "Hello",
      introMsgIndex: -1,
      introMsgsComplete: false,
      //TODO: Abstract away to LottieComponent or fragment
      forwardLoopComplete: false,
      backwardLoopComplete: false,
    };
  }

  async componentDidMount() {
    const spotifyToken = this.props.Spotify.spot_token;

    if (spotifyToken !== "") {
      console.log("Authenticated!");
      const spotifyRequestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotify_token: spotifyToken,
        }),
      };

      let tokenReAuthAPI = spotifyFlaskBaseAPI + "/my_spotify_id";
      // let tokenReAuthPromise =
      this.loop = setInterval(() => this.setIntroMsg(), 2000);
      fetch(tokenReAuthAPI, spotifyRequestOptions)
        .then((response) => response.json())
        .then((data) =>
          this.setState({
            spotifyName: data["user"]["spotifyName"],
            isIdentified: true,
            introMsgs: [
              data["user"]["spotifyName"],
              "Welcome to your liked songs dashboard!",
              "Spotify has yet to offer a good comprehensive solution",
              "to bring power and data back to its users from the songs they listen to.",
              "This serves to act as a small tool to bridge that gap",
              "Enjoy!",
            ],
          })
        );
      let dataLoadingAPI = spotifyFlaskBaseAPI + "/my_spotify_data";
      // let dataLoadingPromise =
      fetch(dataLoadingAPI, spotifyRequestOptions)
        .then((response) => response.json())
        .then((data) =>
          this.setState({
            spotifyData: data["data"],
            isLoading: false,
          })
        );
    }
  }

  setIntroMsg() {
    let currentMsgIndex = this.state.introMsgIndex;
    if (currentMsgIndex >= this.state.introMsgs.length - 1) {
      this.setState({ introMsgsComplete: true });
      clearInterval(this.loop);
    } else {
      let introMsgIndex = currentMsgIndex + 1;
      let introMsg = this.state.introMsgs[introMsgIndex];
      this.setState({ introMsg: introMsg, introMsgIndex: introMsgIndex });
    }
  }

  componentWillUnmount() {
    clearInterval(this.loop);
  }

  //TODO: Abstract away
  renderIntroLottieAnimations() {
    var forwardLottieAnimation = (
      <Lottie
        loop={false}
        animationData={spotifyLogo1}
        play={true}
        onComplete={() => {
          console.log("Forward animation complete!");
          this.setState({
            forwardLoopComplete: true,
          });
        }}
        direction={1}
      />
    );
    var backwardLottieAnimation = (
      <Lottie
        loop={false}
        animationData={spotifyLogo1}
        play={this.state.forwardLoopComplete}
        onComplete={() => {
          console.log("Backwards animation complete!");
          this.setState({
            backwardLoopComplete: true,
          });
        }}
        direction={-1}
      />
    );
    // if (!this.state.forwardLoopComplete && !this.state.backwardLoopComplete) {
    //   console.log("No animations performed! Going Forward");
    //   var lottieAnimation = forwardAnimation;
    // } else if (
    //   this.state.forwardLoopComplete &&
    //   !this.state.backwardLoopComplete
    // ) {
    //   console.log("Forward complete going backward!");
    //   var lottieAnimation = backwardAnimation;
    // } else {
    //   return (
    //     <div>
    //       <p>Place holder text</p>
    //     </div>
    //   );
    // }

    var forwardAnimation = !this.state.backwardLoopComplete ? (
      <div className="forwardAni">{forwardLottieAnimation}</div>
    ) : (
      <div></div>
    );
    var backwardAnimation =
      !this.state.backwardLoopComplete && this.state.forwardLoopComplete ? (
        <div className="backwardAni">{backwardLottieAnimation}</div>
      ) : (
        <div></div>
      );
    var animationMsg = !this.state.backwardLoopComplete
      ? "Asking Mr DJ. to pon de replay"
      : "Loading";

    return (
      <Div
        top={introContainer.top}
        left={introContainer.left}
        pos={introContainer.position}
        transform={introContainer.transform}
        textAlign={introContainer.textAlign}
        className="aniContainer"
      >
        <AnimatePresence>
          <motion.div
            key="forwardAni"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* BUG: Reverse Lottie in two different lotties as opposed to using loop complete to reverse*/}
            {forwardAnimation}
          </motion.div>
          <motion.div
            key="backwardAni"
            // initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {backwardAnimation}
          </motion.div>
          <TextTransition
            text={animationMsg}
            direction="down"
            // className="introMsgText"
            springConfig={presets.stiff}
            inline
          />
        </AnimatePresence>
      </Div>
    );
  }

  //TODO: Abstract away
  renderIntroMsgText(introMsg) {
    return (
      <Div
        top={introContainer.top}
        left={introContainer.left}
        pos={introContainer.position}
        transform={introContainer.transform}
        textAlign={introContainer.textAlign}
      >
        <TextTransition
          text={introMsg}
          direction="down"
          className="introMsgText"
          springConfig={presets.stiff}
          inline
        />
      </Div>
    );
  }

  render() {
    console.log(this.state);
    var isIdentified = this.state.isIdentified;
    var isLoading = this.state.isLoading;
    var spotifyName = this.state.spotifyName;
    var spotifyData = this.state.spotifyData;
    var introMsg = this.state.introMsg;

    var introMsgText = this.state.introMsgsComplete ? (
      <div></div>
    ) : (
      this.renderIntroMsgText(introMsg)
    );
    var lottieIntroAnimations = this.state.introMsgsComplete ? (
      this.renderIntroLottieAnimations()
    ) : (
      <div></div>
    );
    var bgColor = this.state.introMsgsComplete
      ? "white"
      : this.state.isIdentified
      ? "black"
      : "white";
    var bgTransition = this.state.introMsgsComplete
      ? "background-color 2.0s ease-out"
      : "background-color 0.5s linear";
    particleBg["backgroundColor"] = bgColor;
    particleBg["transition"] = bgTransition;

    //var particleType = this.state.introMsgsComplete ? "custom" : "cobweb";
    // var particleNum = this.state.introMsgIndex * 300 + 300;
    // console.log(particleNum);

    return (
      <div className="mainAppContainer">
        <ThemeProvider>
          {introMsgText}
          {lottieIntroAnimations}
          <ParticlesBg
            type="cobweb"
            // num={particleNum}
            color={defaultTheme.colors.green}
            //config={particleConfig}
            bg={particleBg}
          />
        </ThemeProvider>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);
