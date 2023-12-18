import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Signinpage} from './Signin';
import {app} from './Firebase';
import { Outlet, Link } from "react-router-dom";
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore"; 
import { style } from '@mui/system';
const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");
const provider = new GoogleAuthProvider();
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfWhcohAAAAAHU68C_sXVl2K5DPrhks7myqqkc8'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true
});
const db = getFirestore(app);
enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
      } else if (err.code == 'unimplemented') {
          console.log('The current browser does not support all of the features required to enable persistence.');
      }
  });
const auth = getAuth();
function signIn() {
  signInWithPopup(auth, provider)
  .then((result) => {
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
  });
}

const userLocal = JSON.parse(localStorage.getItem('userstate'));
const CurrentUser = () => {
  const [user, loading, error] = useAuthState(auth);
  console.log(user);
  if (error) {
    console.log(error);
    return <div className='card'>Error: {error}</div>;
  }
  if (user) {
    localStorage.setItem('userstate', true);
    console.log(userLocal);
    console.log("Signed in");
    return (
      <div className='appconts'>
      <div className='borderlesscard'>
        <Link to={"/"}>
        <h1 style={{color:"#007CBE", display: "inline-block", marginTop: "20px"}}>Studyio</h1>
        </Link>
        <div style={{float: "right", position: "relative" }}>
        <Link className='profilecircle' style={{background: `url(${user.photoURL}) center/cover`}} to={"/account"}></Link>
      </div>
      </div>
      <Outlet />
    </div>
    )
  }
  if (!user && userLocal === true) {
    return (
      <div style={{height: "100vh", width: "100vw", background: "#3990FF", color: "white", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <h1 style={{marginTop: "20vh", fontSize: "3rem"}}>Studyio</h1>
        <button style={{background: "inherit", display: "block", position: "absolute", bottom: "45px", left: "0", right: "0", outline: "none", border: "none", color: "white", fontSize: "15px", padding: "5px"}} onClick={signout}>Having trouble moving to the next page? <u>Try signing out.</u></button>
      </div>
    )
  }
  else {
    let currentURI = window.location.href;
    if (currentURI.includes("card") || currentURI.includes("test") || currentURI.includes("learn")) {
      localStorage.setItem('userstate', false);
      return (
        <div className='appconts'>
      <div className='borderlesscard'>
        <h1 style={{color:"#007CBE", display: "inline-block", marginTop: "20px"}}>Studyio</h1>
      </div>
      <div className='signinwarn' onClick={signIn}>
        <h2 style={{color: "white"}}>Sign in to start studying smarter.</h2>
      </div>
      <Outlet />
    </div>
      )
    }
    else {
    localStorage.setItem('userstate', false);
    return <Signinpage />;
    }
  }
};

const setSignIn = () => {
  console.log("Signed in");
}

const signout = ()=>  {
  localStorage.setItem('userstate', false);
  signOut(auth).then(() => {

  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
  window.location.reload(false);
}
function App() {
  return (
    <div className="App">
      <header> 

      </header>
      <section>
        <CurrentUser />
      </section> 
    </div>
  );
}

export default App;
