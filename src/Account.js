import React from 'react';
import {Helmet} from "react-helmet";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signOut } from 'firebase/auth';
export default function Account() {
    const auth = getAuth();
    function signout() {
        signOut(auth).then(() => {
        localStorage.setItem('userstate', false);
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
      }
    const [user] = useAuthState(auth);
    return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio: Account</title>
            </Helmet>
            <h1>My Account</h1>
            <button onClick={signout} style={{background: "rgb(190, 35, 35)"}} className="signin">
                    Sign Out
                </button>        
        </div>
    )
}