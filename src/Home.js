import { useEffect, useState } from "react";
import './App.css';
import {app, db} from './Firebase';
import { Link } from "react-router-dom";
import {Helmet} from "react-helmet";
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { onSnapshot, collection, orderBy, limit, query, startAfter, doc, deleteDoc } from "firebase/firestore"
import {MdRemoveCircleOutline, MdOutlineClose, } from "react-icons/md";

const edjsHTML = require("editorjs-html");
const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfWhcohAAAAAHU68C_sXVl2K5DPrhks7myqqkc8'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true
});
const auth = getAuth();
//const db = getFirestore(app);

export default function Home() {
    const [lastvisibility, setlastvisibility] = useState({});
    const [user] = useAuthState(auth);
    const [shown, setShown] = useState(false);
    const [ref, setRef] = useState("");
    console.log(user);
    const [cards, setCards] = useState([]);
    useEffect(() => {
        const q = query(collection(db, "flashcards", `${user.uid}`, "cards"), orderBy('lastModified', 'desc'), limit(5));
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
            setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        })
        setTimeout(() => { unsub(); }, 1000);

    }, []);
    const loadNextSet = () => {
        const q = query(collection(db, "flashcards", `${user.uid}`, "cards"), orderBy('lastModified', 'desc'), limit(6), startAfter(lastvisibility));
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(cards.concat(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))));
            setlastvisibility(snapshot.docs[snapshot.docs.length-1]);
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        }).then(() => {
            console.log("done");
        }).catch((error) => {
            console.log(error);
        });
        unsub();
    }
    function unpin(cardid) {
        deleteDoc(doc(db, "flashcards", `${user.uid}`, "cards", cardid));
    }
    function showDeletebox(cardid) {
        setShown(!shown);
        setRef(cardid);
    }
    return (
        <div className="borderlesscard" style={{marginTop: "10px"}}>
            <Helmet>
                <title>Studyio: Home</title>
            </Helmet>
            <h1>Hello {user.displayName.split(" ")[0]}</h1>
            <div className="projcont">
                <Link to={"/create"} className="div addcard" style={{backgroundColor: "#007CBE", textAlign: "center", verticalAlign: "center", color: "white", textDecoration: 'none', borderRadius: "10px" }}>
                    <h1>Create a set.</h1>
                </Link>
                {/* {cards.map((card, index) => (
                    
                    <Link to={"/card/" + card.uid + "/" + card.id} key={index} className="div" style={{textDecoration: "none"}}>
                        <h1 style={{color: "#212121"}}>{card.name}</h1>
                    </Link>
                ))} */}
                {cards.map((card, index) => {
                    if (card.type == "hyperlink")
                    return (
                        <Link to={"/card/" + card.link} key={index} className="div" style={{textDecoration: "none"}}>
                        <h1 style={{color: "#212121", display: "inline-block"}}>{card.name}</h1>
                        <button className="editbutton"  style={{marginTop: "15px", display: "inline-block"}} onClick={() => unpin(card.id)}><MdRemoveCircleOutline/></button>
                        <h2 style={{marginTop: "-15px", color: "#474747",}}>{card.author}</h2>
                    </Link>
                    )
                    return (
                        <Link to={"/card/" + card.uid + "/" + card.id} key={index} className="div" style={{textDecoration: "none"}}>
                        <h1 style={{color: "#212121"}}>{card.name}</h1>
                        <h2 style={{marginTop: "-15px", color: "#474747",}}>{card.author}</h2>
                        </Link>
                    )
                })}
            </div>
            <button onClick={loadNextSet} className="signin">
                    Load more
                </button>
        </div>
    
    )

}


