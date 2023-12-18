import React from 'react';
import { useState, useEffect } from "react";
import './App.css';
import arrayShuffle from 'array-shuffle';
import {db} from './Firebase';
import { useParams, Link } from "react-router-dom";
import { query, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import {Helmet} from "react-helmet";
import Select from 'react-select';
import {MdOutlineArrowBackIos, MdOutlineArrowForwardIos, MdOutlineFlipToBack, MdOutlineClose} from "react-icons/md";


const auth = getAuth();
function useKeyPress(targetKey) {
    const [keyPressed, setKeyPressed] = useState(false);
    function downHandler({ key }) {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    }
    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };
    useEffect(() => {
      window.addEventListener("keydown", downHandler);
      window.addEventListener("keyup", upHandler);
      return () => {
        window.removeEventListener("keydown", downHandler);
        window.removeEventListener("keyup", upHandler);
      };
    }, []); 
    return keyPressed;
  }
export default function Hub() {
    let params = useParams();
    const [cards, setCards] = useState([]);
    const [flip, setFlip] = useState(false);
    const [cardorder, setCardOrder] = useState(0);
    const [loading, setLoading] = useState(true);
    const [shown, setShown] = useState(true);
    const [firstvalue, setFirstValue] = useState({value: 'definput', label: 'Definition'});
    const leftpress = useKeyPress("ArrowLeft");
    const rightpress = useKeyPress("ArrowRight");
    const spacepress = useKeyPress(" ");
    useEffect(() => {
        const q = query(collection(db, "flashcards", `${params.userID}`, "cards", `${params.setID}`, "content"));            
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(arrayShuffle(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))));
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        })
        setTimeout(() => { unsub(); }, 1000);
        setTimeout(() => { setLoading(false); }, 500);
    }, []);
    useEffect(() => {
        if (leftpress) {
            prevCard();
        }
        if (rightpress) {
            nextCard();
        }
        if (spacepress) {
            flipCard();
        }
    }, [leftpress, rightpress, spacepress]);
    const flipCard = event => {
        setFlip(!flip);
    }
    const showDeletebox = (props) => {
        setShown(current => !current);
    }
    const nextCard = () => {
        if (cardorder < cards.length - 1) {
            setCardOrder(cardorder + 1);
            setFlip(false);
        } 
        else {
            cards.push({front: "You've reached the end of the deck!"});
            setCardOrder(cardorder + 1);
        }
    }
    const prevCard = () => {
        if (cardorder > 0) {
            setCardOrder(cardorder - 1);
            setFlip(false);
        } 
    }
    function Flashcard() {
        let def = cards[cardorder][firstvalue['value']];
        let term = "";
        if (firstvalue['value'] === 'definput') {
         term = cards[cardorder]['terminput'];
        }
        else {
         term = cards[cardorder]["definput"];
        }
        if (def !== undefined) {
            return (
                <button className='flashcard' style={{textAlign: "center", verticalAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit"}} onClick={flipCard}>

                   {flip ? <div><h2 style={{textAlign: "center", fontWeight: "400"}}>{def}</h2></div>: <div><h2 style={{textAlign: "center", fontWeight: "400"}}>{term}</h2> </div>}
                </button>
       )
        }
        else {
            return (
                <div className='flashcard' style={{textAlign: "center",  alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit", marginLeft: "auto", marginRight: "auto"}}>
                    <h2>{cards[cardorder]["front"]}</h2>
                    <h3>You can review these terms again, or go back.</h3>
                    <button className='savebutton' style={{marginLeft: "auto", marginRight: "auto", width: "calc(50% - 20px)"}} onClick={() => setCardOrder(0)}>Review</button>
                    <Link className='savebutton' style={{marginLeft: "auto", marginRight: "auto", textDecoration:"none", width: "calc(50% - 20px)"}} to={`/card/${params.userID}/${params.setID}`}>Go back</Link>
                </div>
            )
        }
    }
    const option = [
        { value: 'terminput', label: 'Term' },
        { value: 'definput', label: 'Definition' },
    ];
    console.log(firstvalue);
    return (
        <div className='borderlesscard'>
            <Helmet>
                <title>Studyio: Flashcards </title>
            </Helmet>
            {loading && <h2>Loading</h2>}
            {!loading && <div>
               <Flashcard/>  
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", width: "100%", maxWidth: "200px", marginLeft: "auto", marginRight: "auto"}}>
               <button className="flashcardbutton" onClick={prevCard} style={{fontSize: "30px"}}><MdOutlineArrowBackIos style={{marginTop: "2px"}}/></button>
               <button className="flashcardbutton" onClick={flipCard} style={{fontSize: "30px"}}><MdOutlineFlipToBack style={{marginTop: "2px"}}/></button>
               <button className="flashcardbutton" onClick={nextCard}><MdOutlineArrowForwardIos style={{marginTop: "2px"}}/></button>
               </div>
            </div>}
            {shown && (
            <div className='overlayblur'>
            <div className='deletecard'>
                <h1 style={{display: "inline-block"}}>Settings</h1>
                <button name="exitbutton" onClick={showDeletebox}  className="editbutton" style={{marginTop: "15px"}}><MdOutlineClose/></button>
                <h3 style={{marginTop: "-10px"}}>Answer with:</h3>
                <Select options={option} defaultValue={option[1]} onChange={setFirstValue}/>
                <h3>Keyboard Shortcuts:</h3>
                <div>
                    <div className="keyboardicon">←</div>
                    <p style={{display: "inline-block", fontSize: "20px", marginLeft: "10px"}}>Previous Card</p>
                </div> 
                <div>
                    <div className="keyboardicon">→</div>
                    <p style={{display: "inline-block", fontSize: "20px", marginLeft: "10px"}}>Next Card</p>
                </div> 
                <div>
                    <div className="keyboardicon" style={{paddingLeft: "10px", paddingRight: "10px"}}>space</div>
                    <p style={{display: "inline-block", fontSize: "20px", marginLeft: "10px"}}>Flip Flashcards</p>
                </div>  
                {/* <button className='signin' onClick={() => deleteCollection()} style={{background: "rgb(190, 35, 35)"}}>Delete</button> */}
            </div>
            </div>
            )}
        </div>
    )
}
