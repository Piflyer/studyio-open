import React from 'react';
import { useState, useEffect } from "react";
import './App.css';
import arrayShuffle from 'array-shuffle';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {db} from './Firebase';
import { useParams, Link } from "react-router-dom";
import { query, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import {Helmet} from "react-helmet";
import Select from 'react-select';
import {MdCheck,  MdShare, MdOutlineSettings, MdOutlineClose} from "react-icons/md";

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
export default function Learn() {
    let params = useParams();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cardorder, setCardOrder] = useState(0);
    const [copied, setCopied] = useState(<MdShare/>);
    const [Feedback, setFeedback] = useState("");
    const [reveal, setReveal] = useState("");
    const [correct, setCorrect] = useState(null);
    let mc = [];
    const [buttonstate, setButtonState] = useState(false);
    const [continuestate, setContinueState] = useState(true);
    const [override, setOverride] = useState(true);
    const [correctreveal, setCorrectReveal] = useState(true);
    const [defshown, setdefshown] = useState("");
    const [hiddenstate, sethiddenstate] = useState(false);
    const [answertype, setAnswerType] = useState({ value: 'write', label: 'Write' });
    const [shown, setShown] = useState(true);
    const [firstvalue, setFirstValue] = useState({value: 'definput', label: 'Definition'});
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
    const showDeletebox = (props) => {
        setShown(current => !current);
    }
    const nextCard = () => {
        if (cardorder < cards.length - 1) {
            setCardOrder(cardorder + 1);
        } 
        else {
            cards.push({front: "You've reached the end of the deck!"});
            setCardOrder(cardorder + 1);
        }
    }
    const sharecard = () => {
        setCopied(<MdCheck/>);
        setTimeout(() => { setCopied(<MdShare/>); }, 5000);
    }
    const option = [
        { value: 'terminput', label: 'Term' },
        { value: 'definput', label: 'Definition' },
    ];
    const option1 = [
        { value: 'write', label: 'Write' },
        { value: 'mc', label: 'Multiple Choice' },
        { value: 'tf', label: 'True/False' },
    ];
    function Learn() {
        const [input, setInput] = useState("");
        let def = cards[cardorder][firstvalue['value']];
        let term = "";
        let cardpu1 = firstvalue['value'];
        if (firstvalue['value'] === 'definput') {
            term = cards[cardorder]['terminput'];
        } 
        else {
            term = cards[cardorder]["definput"];
        }
        if (answertype['value'] === 'write') {
        const formsubmit = (e) => {
            e.preventDefault();
            def = def.trim();
            def = def.toLowerCase();
            let inputval = input.trim();
            inputval = inputval.toLowerCase();
            if (inputval != def) {
                setFeedback("Incorrect!");
                setReveal(def);
                if (cardpu1 === 'definput') {
                    cards.push({definput: def, terminput: term});
                }
                if (cardpu1 === 'terminput') {
                    cards.push({terminput: def, definput: term});
                }
                //setTimeout(() => { setFeedback("");}, 1000);
                //setReveal("");
                setButtonState(true);
                setOverride(false);

            }
            else {
                setFeedback("Correct!");
                //setTimeout(() => { nextCard(); setFeedback("");}, 1000);
                setReveal("");
                setButtonState(true);
                setContinueState(false);
                

            }
        }
        const revealanswer = () => {
            setReveal(def);
            if (cardpu1 === 'definput') {
                cards.push({definput: def, terminput: term});
            }
            if (cardpu1 === 'terminput') {
                cards.push({terminput: def, definput: term});
            }

        }
        const continuebutton = () => {
            setButtonState(false);
            setContinueState(true);
            setOverride(true);
            setFeedback("");
            setReveal("");
            nextCard();
        }
        const contoverride = () => {
            cards.pop();
            setButtonState(false);
            setContinueState(true);
            setOverride(true);
            setFeedback("");
            setReveal("");
            nextCard();
        }
        return (
            <div className='flashcard' style={{textAlign: "center",  alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit", marginLeft: "auto", marginRight: "auto"}}>
                <h2>{Feedback}</h2>
                <h2 style={{textAlign: "center", fontWeight: "400", marginTop: "15px"}}>{term}</h2>
                <h2>{reveal}</h2>
                {def === undefined ? <div><h2>{cards[cardorder]["front"]}</h2><h3>You can review these terms again, or go back.</h3><button className='savebutton' style={{marginLeft: "auto", marginRight: "auto", width: "calc(50% - 20px)"}} onClick={() => setCardOrder(0)}>Review</button><Link className='savebutton' style={{marginLeft: "auto", marginRight: "auto", textDecoration:"none", width: "calc(50% - 20px)"}} to={`/card/${params.userID}/${params.setID}`}>Go back</Link></div> :                 
                <div>
                <div hidden={buttonstate}>
                <form onSubmit={formsubmit}>
                    <input className='learninput' value={input} onChange={(e) => setInput(e.target.value)} placeholder={"Your answer"}></input>
                    <button className='learnbutton' type='submit' style={{display: "inline-block",  left: "10px;", width: "calc(50% - 20px)"}}>Submit</button>
                    <button className='learnbutton' type="button" style={{ right: "10px;", width: "calc(50% - 20px)"}} onClick={revealanswer}>Reveal</button>
                </form>
                </div>
                <div className='wrongcont' hidden={override}>
                    <button className='learnbutton' style={{display: "inline-block",  left: "10px;", width: "calc(50% - 20px)"}} onClick={continuebutton}>Continue</button>
                    <button className='learnbutton' type="button" style={{ right: "10px;", width: "calc(50% - 20px)"}} onClick={contoverride}>Override</button>
                </div>
                <div hidden={continuestate}>   
                    <button className='contbutton' style={{}} onClick={continuebutton}>Continue</button>  
                </div>
                </div>}
                
            </div>
        )            
        }
        if (answertype['value'] === 'tf') {
            if (def === defshown) {
                setCorrect(true);
            }
            if (def !== defshown) {
                setCorrect(false);
            }
            const trueclick = () => {
                sethiddenstate(true);
                setdefshown("");
                setReveal(def);
                if (correct === true) {
                    setFeedback("Correct!");
                }
                else {
                    setFeedback("Incorrect!");
                    if (cardpu1 === 'definput') {
                        cards.push({definput: def, terminput: term});
                    }
                    if (cardpu1 === 'terminput') {
                        cards.push({terminput: def, definput: term});
                    }
                }
                setTimeout(() => { nextCard(); setFeedback(""); setReveal(""); sethiddenstate(false)}, 2000);

            }
            const falseclick = () => {
                sethiddenstate(true);
                setdefshown("");
                setReveal(def);
                if (correct === false) {
                    setFeedback("Correct!");
                }
                else {
                    setFeedback("Incorrect!");
                    if (cardpu1 === 'definput') {
                        cards.push({definput: def, terminput: term});
                    }
                    if (cardpu1 === 'terminput') {
                        cards.push({terminput: def, definput: term});
                    }
                }
                setTimeout(() => { nextCard(); setFeedback(""); setReveal(""); sethiddenstate(false)}, 2000);
            }
            const randomselect = () => {
                let randout = Math.round(Math.random()* 9);
                let randout2 = Math.round(Math.random()* 7);
                if (randout2 % 2 == 0 && randout % 2 == 0) {
                    setdefshown(def);
                }
                else {
                    setdefshown(cards[Math.floor(Math.random()*cards.length)][firstvalue['value']]);
                }
            }
            randomselect();
            return(
                <div className='flashcard' style={{textAlign: "center",  alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit", marginLeft: "auto", marginRight: "auto"}}>
                {def === undefined ? <div><h2>{cards[cardorder]["front"]}</h2><h3>You can review these terms again, or go back.</h3><button className='savebutton' style={{marginLeft: "auto", marginRight: "auto", width: "calc(50% - 20px)"}} onClick={() => setCardOrder(0)}>Review</button><Link className='savebutton' style={{marginLeft: "auto", marginRight: "auto", textDecoration:"none", width: "calc(50% - 20px)"}} to={`/card/${params.userID}/${params.setID}`}>Go back</Link></div> :                 
                <div>
                <h2>{Feedback}</h2>
                <h2 style={{textAlign: "center", fontWeight: "400", marginTop: "15px"}}>{term}</h2>
                <h2 hidden={hiddenstate}>{defshown}</h2>
                <h2>{reveal}</h2>
                <button className='learnbutton' style={{display: "inline-block", right: "10px;", width: "calc(50% - 20px)"}} onClick={falseclick}>False</button>
                <button className='learnbutton' style={{ left: "10px;", width: "calc(50% - 20px)"}} onClick={trueclick}>True</button>
                </div>}
                </div>
            )
        }

        if (answertype['value'] === 'mc') {
            mc.push(def);
            if (cards.length > 4) {
                for (let i = 0; i < 3; i++) {
                    let randout = Math.floor(Math.random()*cards.length);
                    let randou2 = cards[randout][firstvalue['value']];
                    if (randou2 === def || mc.includes(randou2)) {
                        i--;
                    }
                    else {
                        mc.push(randou2);
                    }
                }
                const mcselect = (e) => {
                    setCorrectReveal(false)
                    sethiddenstate(true);
                    setdefshown("");
                    setReveal(def);
                    setContinueState(false);
                    if (e.target.value === def) {
                        setFeedback("Correct!");
                    }
                    else {
                        setFeedback("Incorrect!");
                        if (cardpu1 === 'definput') {
                            cards.push({definput: def, terminput: term});
                        }
                        if (cardpu1 === 'terminput') {
                            cards.push({terminput: def, definput: term});
                        }
                    }
                    setTimeout(() => { }, 4000);
                }
                const movingon = () => {
                    setCorrectReveal(true); 
                    setContinueState(true);
                    nextCard(); 
                    setFeedback(""); 
                    setReveal(""); 
                    sethiddenstate(false)
                }
                return (
                    <div className='flashcard' style={{textAlign: "center",  alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit", marginLeft: "auto", marginRight: "auto"}}>
                        {term === undefined ? <div><h2>{cards[cardorder]["front"]}</h2><h3>You can review these terms again, or go back.</h3><button className='savebutton' style={{marginLeft: "auto", marginRight: "auto", width: "calc(50% - 20px)"}} onClick={() => setCardOrder(0)}>Review</button><Link className='savebutton' style={{marginLeft: "auto", marginRight: "auto", textDecoration:"none", width: "calc(50% - 20px)"}} to={`/card/${params.userID}/${params.setID}`}>Go back</Link></div> :
                        <div>
                        <h2>{term}</h2>
                        <h2>{Feedback}</h2>
                        <div className='mcbox'>
                        <div className='correctanswer'  style={{fontSize: "20px", border: "none"}} hidden={correctreveal}>{reveal}</div>
                        <div hidden={continuestate}>
                        <button className='mcselector' style={{background: "#007CBE", color: "white", textAlign: "center"}} onClick={movingon}>Continue</button>  
                        </div>
                        <div hidden={hiddenstate}>
                        {mc.map((item, index) => (
                            <button value={item} className='mcselector' onClick={(value) => mcselect(value)}>{item}</button>
                        ))}
                        </div>
                        </div>
                        </div>    
                        }      
                    </div>
                )
            }
            else {
                return(
                    <div className='flashcard' style={{textAlign: "center",  alignItems: "center", justifyContent: "center", outline: "none", border: "none", background: "inherit", marginLeft: "auto", marginRight: "auto"}}>
                    <h1>You need at least 4 terms with different values to use learn multiple choice. Use the gear icon to use another learning method.</h1>
                    </div>
                )
            }
        }
        else {
            return(
                <div>
                    <h1>Something went wrong. Click on the gear and choose a learn mode.</h1>
                </div>
            )
        }
    }
    return (
        <div className="borderlesscard">
            <Helmet>
                <title>Studyio: Learn </title>
            </Helmet>
            {loading && <h2>Loading</h2>}
            {!loading && <div>
               <Learn/> 
               <button className="flashcardbutton" onClick={showDeletebox} style={{fontSize: "30px", display: "block", marginLeft: "auto", marginRight: "auto"}}><MdOutlineSettings style={{marginTop: "2px"}}/></button>
            </div>}
            {shown && (
            <div className='overlayblur'>
            <div className='deletecard'>
                <h1 style={{display: "inline-block"}}>Settings</h1>
                <button name="exitbutton" onClick={showDeletebox}  className="editbutton" style={{marginTop: "15px"}}><MdOutlineClose/></button>
                <h3 style={{marginTop: "-10px"}}>Answer with:</h3>
                <Select options={option} defaultValue={option[1]} onChange={setFirstValue}/>
                <h3 style={{}}>Answer Type:</h3>
                <Select options={option1} defaultValue={option1[0]} onChange={setAnswerType}/> 
                {/* <button className='signin' onClick={() => deleteCollection()} style={{background: "rgb(190, 35, 35)"}}>Delete</button> */}
            </div>
            </div>
            )}
        </div>
    )
}