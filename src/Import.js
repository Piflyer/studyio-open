import { useState, useEffect } from "react";
import './App.css';
import {Helmet} from "react-helmet";
import {app} from './Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore, Timestamp, addDoc, collection, setDoc, doc } from "firebase/firestore"
import {useNavigate } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import React from 'react';


function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}
const auth = getAuth();
const db = getFirestore(app);
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


export default function Import() {
    const [title, setTitle] = useState("");
    const [create, setCreate] = useState("Import");
    const [cards,  setCards] = useState([]);
    const [user] = useAuthState(auth);
    //useScript("https://cdn.jsdelivr.net/npm/quizlet-fetcher@1.1.0/dist/parser.min.js");
    async function HandleCreate() {
        const docRef = makeid(15);
        if (title === "") {
            alert("Please enter a title.");
            return;
        }
        if (cards.length === 0) {
            alert("Please add at least one card.");
            return;
        }
        else {
            setDoc(doc(db, "flashcards", `${user.uid}`, "cards",`${docRef}`), {
                name: title,
                lastModified: Timestamp.now(),
                author: user.displayName,
                uid: user.uid,
                picture: user.photoURL,
                user: user.uid
              }).catch((error) => {
                  console.log(error);
                    setCreate("Error");
                    
              });
              setCreate("Saving...");
              setTimeout(() => {               
                for (let i = 0; i < cards.length; i++){
                    if (cards[i].terminput === "" || cards[i].definput === "") {
                        alert("Please fill in all fields.");
                        return;
                    }
                    else {
                        setDoc(doc(db, "flashcards", `${user.uid}`, "cards", `${docRef}`, "content", `${i}`), {
                            terminput: cards[i].terminput,
                            definput: cards[i].definput
                        }).catch((error) => {
                            setCreate("Error");
                        });
                        console.log('Created new set');
                        setCreate("Set Imported");
                        setTimeout(() => {redirect();}, 500);
                      }
                    }
              }, 500)     
        }
    }
    const navigate = useNavigate();
    function redirect() {
        navigate("/home");
    }
    document.documentElement.setAttribute('data-color-mode', 'light')
    return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio: Create</title>
            </Helmet>
            <h1>Import a Quizlet Set</h1>
                <input className="titlebox" style={{}} placeholder="Quizlet URL" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                <button style={{display: "inline-block"}} className='create'  onClick={HandleCreate}>{create}</button>
            <div>
            </div>
        </div>
    )
}
