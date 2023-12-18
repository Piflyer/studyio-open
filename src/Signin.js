import React from 'react';
import './App.css';
import {app} from './Firebase';
import learnexample from "./learnexample.webp";
import { getAuth, signInWithPopup, GoogleAuthProvider,isSignInWithEmailLink, signInWithEmailAndPassword, signInWithEmailLink, sendSignInLinkToEmail} from 'firebase/auth';
import { Helmet } from 'react-helmet';
import { MdOutlineClose} from "react-icons/md";
const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfWhcohAAAAAHU68C_sXVl2K5DPrhks7myqqkc8'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true
});
const auth = getAuth();
const provider = new GoogleAuthProvider();
//Create login page for new users
export const Signinpage = () => {
    const [email, setEmail] = React.useState('');
    const [email2, setEmail2] = React.useState('');
    const [errors, setError] = React.useState('');
    const [shown, setShown] = React.useState(false);
    let reemail;
    const showDeletebox = (props) => {
        setShown(current => !current);
    }
    function emailsubmit(event) {
        event.preventDefault();
        reemail = email2;
        //document.getElementsByClassName("overlay")[0].style.display = "none";
    }
    function signIn() {
        signInWithPopup(auth, provider)
        .then((result) => {
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorMessage == "Firebase: Error (auth/user-disabled).") {
            setError("Your account has been disabled. Contact support for more information.");
          }
          else {
            setError(errorMessage);
          }
          console.log(errorMessage);
        });
    }
    const actionCodeSettings = {
        url: 'https://studyio.thisistimnguyen.com/',
        handleCodeInApp: true
    };
    function emailsignin(event){
        event.preventDefault();
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            setError("Check your email for a sign in link");
        }).catch((error) => {
            const errorMessage = error.message;
            if(errorMessage == "Firebase: Error (auth/missing-email)."){
                setError("Please enter an email address");
            }
            else if(errorMessage == "Firebase: Error (auth/invalid-email."){
                setError("Please enter a valid email address");
            }
            else {
                setError(errorMessage);
            }
        });
    }
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        var link = window.location.href.includes("apiKey");
        if (!email &&  link == true) {
            
            // Overlayon();
            // console.log("jetblue");
            // email = email2;
        }
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
              setError("Please try signing in again.");
          });
      }

      return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio</title>
            </Helmet>
            <h1 style={{color:"#007CBE", display: "inline-block", marginTop: "20px"}}>Studyio</h1>
            <button style={{float: "right", position: "relative", height: "45px", width: "120px", background: "#3990FF", borderRadius: "10px", marginTop: "25px", textAlign: "center", color: "white", fontSize: "25px", lineHeight: "40px", fontWeight: "bold", outline: "none", border: "none" }} onClick={showDeletebox}>
                Sign In
            </button>
            {shown && (
            <div className='overlayblur'>
            <div className='deletecard'>
            <div>
                <h1 style={{fontSize: "2.5em", display: "inline-block", textAlign: "left"}}>Welcome to Studyio!</h1>
                <button name="exitbutton" onClick={showDeletebox}  className="editbutton" style={{marginTop: "15px"}}><MdOutlineClose/></button>
                <h2 style={{fontSize: "25px", textAlign: "center"}}>Sign in to get started.</h2>
                {/* <form onSubmit={emailsignin}>
                        <input placeholder='Email' className="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
                        <p>{errors}</p>
                        <button className='signin'  type="submit"> Passwordless Sign In</button>
                </form>
                <div className='divider'></div> */}
                    <button className='signin'  onClick={signIn}>Sign in with Google</button>
                </div>
            </div>
            </div>
            )}
            <h1 style={{fontSize: "2.75em", marginTop: "40px"}}>Study smarter. Not harder.</h1>
            <div className='borderlesscard'>
                <div className='term' style={{background: "#3990FF", marginTop: "2px", borderRadius: "10px"}}>
                    <h1 style={{color: "white"}}>Create Flashcards Effortlessly.</h1>
                    <p style={{fontSize: "20px", color: "white"}}>Studyio makes it easy to create flashcards. Just type in your question and answer, and Studyio will do the rest. Have an existing set? Studyio allows you to import existing sets instantly.</p>
                </div>
                <div className="def">
                    <h1>Study Anywhere.</h1>
                    <p style={{fontSize: "20px"}}>Studyio is available on as a web app for all devices. Studyio is also available offline, so you can study anywhere, anytime.</p>
                </div>
            </div>
            <div className='borderlesscard' style={{marginTop: "20px"}}>
                <div className='def' style={{background: "#3990FF", marginTop: "2px", borderRadius: "10px"}}>
                    <h1 style={{color: "white"}}>Smarter Learning Tools.</h1>
                    <p style={{fontSize: "20px", color: "white"}}>Studyio makes learning easy. Want to learn some new terms? You can use Studyio to learn through multiple choice, writing, or true/false questions. Studyio will automatically add terms back to the deck that you missed. Want to test your knowledge? Studyio can create practice tests to practice with. All for free.  </p>
                </div>
                <div className='term' style={{background: `url("learnexample.webp") center/cover`, marginTop: "5px", borderRadius: "10px"}}>
                    <h1>Secure and Simple.</h1>
                    <p style={{fontSize: "20px"}}>You are in control of your flashcards. Want to share them with your friends? You can share sets that you have created with link. Your cards cannot be accessed without a shared link. We also don't put distracting ads that interrupt your studying.</p>
                </div>
            </div>
            <div className='borderlesscard' style={{textAlign: "center"}}>
                <h1 style={{fontSize: "2.75em", marginTop: "40px"}}>Start Studying Smarter Today.</h1>
                <button style={{height: "45px", width: "200px", background: "#3990FF", borderRadius: "10px", marginTop: "25px", textAlign: "center", color: "white", fontSize: "25px", lineHeight: "40px", fontWeight: "bold", outline: "none", border: "none" }} onClick={showDeletebox}>
                Join Studyio
                </button>
            </div>
            <p style={{marginTop: "80px", textAlign: "center"}}>Ⓒ 2022 | Studyio was proudly built by <a style={{textDecoration: "underline"}} href="https://thisistim.dev">Tim Nguyen</a></p>
        </div>
      );
}