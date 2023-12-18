import TextareaAutosize from 'react-textarea-autosize';
import { useState } from "react";
import './App.css';
import {Helmet} from "react-helmet";
import {app} from './Firebase';
import {MdDelete} from "react-icons/md";
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


export default function Create() {
    const [title, setTitle] = useState("");
    const [create, setCreate] = useState("Create");
    const [cards,  setCards] = useState([]);
    const [user] = useAuthState(auth);
    const [shown, setShown] = useState(false);
    const [termsep, setTermSep] = useState("");
    const [defsep, setDefSep] = useState("");
    const [importcard, setImportcard] = useState("");
    //console.log(editorjs);
    const HandleAddCard = () => {
        setCards([...cards, {"terminput" : "", "definput" : ""}]);
        
    }
    const HandleRemoveCard = (index) => {
        const newCards = [...cards];
        newCards.splice(index, 1);
        setCards(newCards);
    }
    const showImportBox = event => {
        setShown(current => !current);
    }
    const HandleAddtoSet = () => {
        const newCards = [...cards];
        const importcardarray = importcard.split(defsep);

        for (let i = 0; i < importcardarray.length; i++) {
            newCards.push({"terminput" : importcardarray[i].split(termsep)[0], "definput" : importcardarray[i].split(termsep)[1]});
        }
        setCards(newCards);
        setImportcard("");
    }
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
                //entry: savedData,
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
                        setCreate("Set Created");
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
    const HandleCardChanges = (e, index) => {
        const {name, value} = e.target;
        const newCards = [...cards];
        newCards[index][name] = value;
        setCards(newCards);
    }
    // const HandleEditorCahnges = (o, index) => {
    //     //const savedData = await instanceRef.current.create();
    //     const { value} = o.target;
    //     const newEditor = [...editorjs];
    //     newEditor[index]["definput"] = value;
    //     setEditorjs(newEditor);
    // }
    // const ReactEditorJS = createReactEditorJS({
    //     holder: 'editor-js',
    //     minHeight : 0
    
    // });
    document.documentElement.setAttribute('data-color-mode', 'light')
    return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio: Create</title>
            </Helmet>
            <h1>Create a new set</h1>
                <input className="titlebox" style={{}} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                <button style={{display: "inline-block"}} className='create'  onClick={HandleCreate}>{create}</button>
            {cards.map((card, index) => (
            <div className='card' key={(index)}>
                <div className='term'>
                    <h2>Term #{index + 1}:</h2>
                    <TextareaAutosize name="terminput" placeholder='Type in a term' value={card.terminput} onChange={(e) => HandleCardChanges(e, index)}/>
                </div>
                <div className='def'>
                    <h2 style={{display: "inline-block"}}>Definition:</h2>
                    <button className="deletebutton" onClick={() => HandleRemoveCard(index)} >
                         <MdDelete/>
                    </button>
                    {/* <ReactEditorJS id={(index)} instanceRef={instance => (instanceRef.current = instance)} tools={EDITOR_JS_TOOLS} style={{width: "100%", zIndex: "100"}} value={editorjs.definput} onChange={(e) => HandleEditorCahnges(e, index)}/> */}
                    {/* <MDEditor name="definput" textareaProps={{placeholder: "Enter Markdown text" }} value={card.definput} onChange={(event) => HandleCardChanges(event, index)} previewOptions={{rehypePlugins: [[rehypeSanitize]],}} style={{width: "calc(100% - 20px)"}}/> */}
                    <TextareaAutosize className='definput' name="definput" placeholder='Type in a definition' value={card.definput} onChange={(e) => HandleCardChanges(e, index)}/>
                </div> 
            </div>
            ))}

            {shown && (
                <div className='card' style={{padding: "20px"}}>
                <h2 style={{display: "inline-block"}}>Import Terms</h2>
                <button className="deletebutton" onClick={showImportBox} >
                         <MdDelete/>
                    </button>
                <div>
                <div className='termbox' style={{display: "inline-block"}}>
                    <input className="termseperator" style={{}} placeholder="Separates term and definition" value={termsep} onChange={(e) => setTermSep(e.target.value)}></input>
                </div>
                <div className='termbox'style={{display: "inline-block"}}>
                    <input className="termseperator" style={{}} placeholder="Separates each flashcard (enter doesn't work)" value={defsep} onChange={(e) => setDefSep(e.target.value)}></input>
                </div>
                </div> 
                <TextareaAutosize className='definput' name="definput" placeholder='Type in terms and definition' value={importcard} onChange={(e) => setImportcard(e.target.value)}/>     
                <button className='savebutton' onClick={HandleAddtoSet} style={{marginLeft: "auto", marginRight: "auto", width: "calc(50% - 30px)"}}>Add to set</button>
                </div>
            )}
            <div>
                <button className='savebutton' onClick={HandleAddCard} style={{display: "inline-block", float: "left", width: "calc(50% - 30px)"}}>Add Card</button>
                <button className='savebutton' onClick={showImportBox} style={{display: "inline-block", float: "right", width: "calc(50% - 30px)"}}>Import Terms</button>
            </div>
        </div>
    )
}
