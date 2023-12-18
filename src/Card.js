import React from 'react';
import { useState, useEffect } from "react";
import './App.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { db} from './Firebase';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, startAfter, limit, query, collection, onSnapshot, deleteDoc, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import ScriptTag from 'react-script-tag';
import {useAsyncEffect} from '@react-hook/async'
import {Helmet} from "react-helmet";
import {MdDelete, MdEdit, MdOutlineClose, MdContentCopy, MdSavedSearch, MdShare, MdCheck} from "react-icons/md";

const auth = getAuth();
//const db = getFirestore(app);


export default function Card() {
    let params = useParams();
    const [title, setTitle] = useState('');
    const [cards, setCards] = useState([]);
    const [copied, setCopied] = useState(<MdShare/>);
    const [lastvisibility, setlastvisibility] = useState({});
    const [shown, setShown] = useState(false);
    const [name, setName] = useState('');
    const [database, setDatabase] = useState("");
    const [user] = useAuthState(auth);
    console.log("user: ", user);
    const navigate = useNavigate();
    const [loadBut, setloadBut]  = useState('visible');
    function redirect() {
        navigate("/home");
    }
    const showDeletebox = (props) => {
        setShown(current => !current);
    }
    const metadata = useAsyncEffect(async() => {
        const docRef = doc(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`);
        return getDoc(docRef).then((journal) => {
            //if (!journal.exists()) setMessages("Journal does not exist");
            setDatabase(journal.data());
            setTitle(journal.data().name);
            setName(journal.data().author);
        });
    }, []); 
    useEffect(() => {
        const q = query(collection(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`, "content"), limit(9));
        // getDocs(query(collection(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`, "content"), limit(2))).forEach((doc) => {
        //     console.log(doc.id, " => ", doc.data());
        //     //setCards({ ...cards, [doc.id]: doc.data() });
        //     const source = doc.metadata.fromCache ? "local cache" : "server";
        //     console.log("Data came from " + source);
        // })        
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
            setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        })
        setTimeout(() => { unsub(); }, 1000);
    }, []);
    // const load = useAsyncEffect(async() => {
    //     const load = query(collection(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`, "content"), limit(9));
    //     return getDocs(load).then((snapshot) => {
    //         setCards(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
    //         setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
    //         const source = snapshot.metadata.fromCache ? "local cache" : "server";
    //         console.log("Data came from " + source);
    //     })
    // }, []);
    const loadNextSet = () => {
        const q = query(collection(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`, "content"), limit(6), startAfter(lastvisibility));
        // return getDocs(q).then((snapshot) => {
        //     setCards([...cards, ...snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))]);
        //     setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
        //     const source = snapshot.metadata.fromCache ? "local cache" : "server";
        //     console.log("Data came from " + source);
        // });
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(cards.concat(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))));
            setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        }).catch((error) => {
            console.log(error);
            setloadBut("hidden");
        });
    }
    const deleteCollection = () => {
        const q = query(collection(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`, "content"));
        let unsub = onSnapshot(q, (snapshot) => {
            snapshot.docs.forEach((doc) => {
                //console.log(doc.ref, " => ", doc.data());
                deleteDoc(doc(db, doc.ref));
            });
        });
        setTimeout(() => { unsub(); }, 1000);
        deleteDoc(doc(db, "flashcards", `${params.usID}`, "cards", `${params.cardID}`));
        setTimeout(() => { redirect(); }, 1000);
    }
    const pintohome = () => {
        addDoc(collection(db, "flashcards", `${user.uid}`, "cards"), {
            name: title,
            type: "hyperlink",
            lastModified: Timestamp.now(),
            link: `${params.usID}/${params.cardID}`,
            author: name
        });
        alert("Saved to your home page");
    }
    const sharecard = () => {
        setCopied(<MdCheck/>);
        setTimeout(() => { setCopied(<MdShare/>); }, 5000);
    }
    return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio: {title}</title>
            </Helmet>
            {/* <input className='titleinput' placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)}></input> */}
            <h1>{title}</h1>
            <h2 style={{display: "inline-block"}}>By {name}</h2>
            <div id="likebtnapi-main" className='likebtnapi-main' style={{display: "inline-block", padding: "0px", display: "block", fontSize: "24px", fontFamily: "Open Sans, sans-serif", borderRadius: "5px", color: "#0080ff", outline: "none", border: "none", cursor: "pointer", boxShadow: "none"}}></div>
            <div className='projcont' style={{marginTop: "20px"}}>
                <Link className='div' style={{minHeight: "50px", backgroundColor: "#007CBE", color: "white", textDecoration: "none" }} to={`/flashcard/${params.usID}/${params.cardID}`}>
                    <h1>Flashcards</h1>
                </Link>
                <Link className='div' style={{minHeight: "50px", backgroundColor: "#007CBE", color: "white", textDecoration: "none"}} to={`/learn/${params.usID}/${params.cardID}`}>
                    <h1>Learn</h1>
                </Link>
                <Link className='div' style={{minHeight: "50px", backgroundColor: "#007CBE", color: "white", textDecoration: "none"}} to={`/test/${params.usID}/${params.cardID}`}>
                    <h1>Test</h1>
                </Link>
            </div>
            <h2 style={{display: "inline-block"}}>Terms:</h2>
            {(user !== null && (params.usID === user.uid)) ? <div style={{display: "inline-block", float: "right", marginTop: "0px"}}><button className="deletebutton" style={{marginTop: "5px"}} onClick={showDeletebox} ><MdDelete/></button><Link className="editbutton" style={{marginTop: "5px"}} to={`/edit/${params.usID}/${params.cardID}`}><MdEdit/></Link><CopyToClipboard className="editbutton" style={{marginTop: "5px"}} text={window.location.href} onCopy={() => sharecard()}>{copied}</CopyToClipboard></div>: <div style={{display: "inline-block", float: "right", marginTop: "5px"}} onClick={pintohome}><button className="editbutton" style={{marginTop: "5px", float: "left"}}><MdSavedSearch/></button><Link className="editbutton" style={{marginTop: "5px"}} to={user !== null ? `/edit/${params.usID}/${params.cardID}`: "#"}><MdContentCopy/></Link><CopyToClipboard className="editbutton" style={{marginTop: "5px"}} text={window.location.href} onCopy={() => sharecard()}>{copied}</CopyToClipboard></div>}
            <div className='projcont' style={{marginTop: "10px"}}>
            {cards.map((card, index) => (
            <div className='div' key={index}>
            <h2 style={{marginBottom: "0px", display: "inline-block"}}>{card.terminput}</h2>
            {/* <button className="deletebutton" style={{marginTop: "5px"}} onClick={() => HandleRemoveCard()} >
                     <MdDelete/>
            </button> */}
            <p>{card.definput}</p>
        </div>
            ))}
            {shown && (
            <div className='overlayblur'>
            <div className='deletecard'>
                <h1 style={{display: "inline-block"}}>Delete this set</h1>
                <button name="exitbutton" onClick={showDeletebox}  className="editbutton" style={{marginTop: "15px"}}><MdOutlineClose/></button>
                <h2>Are you sure you want to delete this set? This action cannot be undone.</h2>
                <button className='signin' onClick={() => deleteCollection()} style={{background: "rgb(190, 35, 35)"}}>Delete</button>
            </div>
            </div>
            )}
            </div>
            <button onClick={loadNextSet} style={{visibility: loadBut}} className="signin">
                    Load more
                </button>
        </div>
    )
}