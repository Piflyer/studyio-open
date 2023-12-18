import React from "react";
import { useState, useEffect } from "react";
import './App.css';
import arrayShuffle from 'array-shuffle';
import {db} from './Firebase';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { query, collection, onSnapshot } from "firebase/firestore";
import { FormControl, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import { getAuth } from 'firebase/auth';
import {Helmet} from "react-helmet";
import {MdCheck, MdOutlineClose} from "react-icons/md";
import Select from 'react-select';


const auth = getAuth();
export default function Test() {
    let params = useParams();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [user] = useAuthState(auth);
    const [testshown, setTestshown] = useState(false);
    const navigate = useNavigate();
    const [shown, setShown] = useState(true);
    const [score, setScore] = useState(0);
    const [firstvalue, setFirstValue] = useState({value: 'definput', label: 'Definition'});
    const [answertype, setAnswerType] = useState({ value: 'none', label: 'Select' });
    const [disable, setDisable] = useState(false);
    var answermc = [];
    useEffect(() => {
        const q = query(collection(db, "flashcards", `${params.userID}`, "cards", `${params.setID}`, "content"));            
        let unsub = onSnapshot(q, (snapshot) => {
            setCards(arrayShuffle(snapshot.docs.map(doc => ({...doc.data(), id: doc.id}))));
            const source = snapshot.metadata.fromCache ? "local cache" : "server";
            console.log("Data came from " + source);
        })
        setTimeout(() => { unsub(); }, 1000);
        setTimeout(() => { setLoading(false);}, 1000);
    }, []);
    const showDeletebox = (props) => {
        setShown(current => !current);
    }
    const changeMC = (props) => {
        setAnswerType({value: 'write', label: 'Write'});
    }
    const showTestbox = (props) => {
        setTestshown(current => !current);
    }
    const option = [
        { value: 'terminput', label: 'Term' },
        { value: 'definput', label: 'Definition' },
    ];
    const option1 = [
        { value: 'none', label: 'Select' },
        { value: 'mc', label: 'Multiple Choice' },
        { value: 'write', label: 'Write' },
    ];
    const Submittest = () => {
        console.log(answermc);
        let score = 0;
        for (let i = 0; i < cards.length; i++) {
            let answer = cards[i][firstvalue.value];
            answer = answer.toLowerCase();
            answer.trim();
            let correct = answermc[i];
            try {
                correct = correct.toLowerCase();
                correct.trim();
            } catch (error) {}
            if (correct === answer) {
                score++;
                console.log(i + "right");
                document.getElementsByClassName("rightfeedback")[i].style.display = "inline-block";
                if (answertype["value"] === "write") {
                    document.getElementsByClassName("testinput")[i].disabled = true;
                }
            }
            else {
                console.log(i + "wrong");
                document.getElementsByClassName("wrongfeedback")[i].style.display = "inline-block";
                if (answertype["value"] === "write") {
                    document.getElementsByClassName("testinput")[i].disabled = true;
                }
            }
        }
        setDisable(true);
        setTestshown(true);
        document.getElementsByClassName("mcselector")[0].style.display = "none";
        score = score/cards.length;
        score = Math.round(score*100);
        setScore(score);
    }
    const mcselect = (e, pindex) => {
        console.log(e.target.value);
        console.log(answermc);
        answermc[pindex] = e.target.value;
        console.log(answermc);
    }
    if (answertype['value'] === 'mc') { 
        if (cards.length > 4) {
            function Multics(props) {
                let mc = [];
                mc.push(props.answer);
                if (cards.length > 4) {
                    for (let i = 0; i < 3; i++) {
                        let randout = Math.floor(Math.random()*cards.length);
                        // let randou2 = cards[randout]["definput"];
                        let randou2 = cards[randout][firstvalue['value']];
                        if (randou2 === props.answer || mc.includes(randou2)) {
                            i--;
                        }
                        else {
                            mc.push(randou2);
                        }
                    }
                }
                mc = arrayShuffle(mc);
                return (
                    <FormControl style={{marginTop: "10px", position: "relative", display: "block"}} disabled={disable}>
                        <RadioGroup aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group">
                            {mc.map((item, index) => (
                                // <button key={`${props.index}${index}`} id={`${props.index}${index}`} value={item} className='mcselector' onClick={(value) => mcselect(value, index, `${props.index}${index}`)}>{item}</button>
                                <FormControlLabel value={item}  control={<Radio />} label={item} onClick={(value) => mcselect(value, props.index)} style={{ padding: "5px"}}/>
                            ))}
                        </RadioGroup>
                    </FormControl>
                )
        
            }
            return (
                <div className="borderlesscard">
                    <h1>Multiple Choice Test</h1>
                    {firstvalue['value'] === 'definput' ?
                    <div>
                    {cards.map((card, index) => (
                    <div className='card' key={(index)}>
                            <h2 style={{display: "inline-block"}}>{index + 1}: {card.terminput}</h2>
                            <div className={"rightfeedback"} style={{fontSize: "30px", color: "green", float: "right", marginBottom: "5px"}}><MdCheck/></div>
                            <div className={"wrongfeedback"} style={{fontSize: "30px", color: "red", float: "right", marginBottom: "5px"}}><MdOutlineClose/></div>
                            <Multics answer={card.definput} index={index}/>
                            {disable ? <div><h3>Correct Answer:</h3><p>{card.definput}</p></div>: null}
                    </div>
                    ))}                    
                    </div>    
                    :
                    <div>
                    {cards.map((card, index) => (
                    <div className='card' key={(index)}>
                            <h2 style={{display: "inline-block"}}>{index + 1}: {card.definput}</h2>
                            <div className={"rightfeedback"} style={{fontSize: "30px", color: "green", float: "right", marginBottom: "5px"}}><MdCheck/></div>
                            <div className={"wrongfeedback"} style={{fontSize: "30px", color: "red", float: "right", marginBottom: "5px"}}><MdOutlineClose/></div>
                            <Multics answer={card.terminput} index={index}/>
                            {disable ? <div><h3>Correct Answer:</h3><p>{card.terminput}</p></div>: null}
                    </div>
                    ))}                                        
                    </div>    
                }
                    <button hidden={disable} className='mcselector' style={{background: "#3990FF", color: "white", textAlign: "center"}} onClick={Submittest}>Submit Test</button>  
                    {testshown && (
                        <div className='overlayblur'>
                        <div className='deletecard'>
                            <h1 style={{display: "inline-block"}}>Results</h1>
                            {score > 80  ? <h1 style={{color: "green"}}>You got {score}%! Well done!</h1> : <h1 style={{color: "red"}}>You got {score}%. Almost there!</h1>}
                            <button name="exitbutton" onClick={showTestbox}  className='mcselector' style={{background: "#3990FF", color: "white", textAlign: "center"}}>Review Test</button>
                        </div>
                        </div>
                )}                
                </div>
            )
        }
        else {
            return (
                <div className="borderlesscard">
                    <h1>Multiple Choice Test</h1>
                    <h2>Not enough cards to make a test. Use write instead.</h2>
                    <button name="exitbutton" onClick={changeMC}  className='mcselector' style={{background: "#3990FF", color: "white", textAlign: "center"}}>Change to Write</button>
                    <Link to={`/cards/${params.userID}/${params.setID}`}>Exit Test</Link>
                </div>
            )
        } 
    }
    if (answertype['value'] === "write") {
        return (
            <div className="borderlesscard">
                <h1>Writing Test</h1>
                {firstvalue['value'] === 'definput' ?
                <div>
                {cards.map((card, index) => (
                <div className='card' key={(index)}>
                        <h2 style={{display: "inline-block"}}>{index + 1}: {card.terminput}</h2>
                        <div className={"rightfeedback"} style={{fontSize: "30px", color: "green", float: "right", marginBottom: "5px"}}><MdCheck/></div>
                        <div className={"wrongfeedback"} style={{fontSize: "30px", color: "red", float: "right", marginBottom: "5px"}}><MdOutlineClose/></div>
                        <input className='testinput' value={answermc[index]} onChange={(value) => mcselect(value, index)} placeholder={"Your answer"} style={{display: "block", position: "relative"}}></input>
                        {disable ? <div><h3>Correct Answer:</h3><p>{card.definput}</p></div>: null}
                </div>
                ))}                    
                </div>    
                :
                <div>
                {cards.map((card, index) => (
                <div className='card' key={(index)}>
                        <h2 style={{display: "inline-block"}}>{index + 1}: {card.definput}</h2>
                        <div className={"rightfeedback"} style={{fontSize: "30px", color: "green", float: "right", marginBottom: "5px"}}><MdCheck/></div>
                        <div className={"wrongfeedback"} style={{fontSize: "30px", color: "red", float: "right", marginBottom: "5px"}}><MdOutlineClose/></div>
                        <input className='learninput' value={answermc[index]} onChange={(value) => mcselect(value, index)} placeholder={"Your answer"}></input>
                        {disable ? <div><h3>Correct Answer:</h3><p>{card.terminput}</p></div>: null}
                </div>
                ))}                                        
                </div>    
            }
                <button hidden={disable} className='mcselector' style={{background: "#3990FF", color: "white", textAlign: "center"}} onClick={Submittest}>Submit Test</button>  
                {testshown && (
                    <div className='overlayblur'>
                    <div className='deletecard'>
                        <h1 style={{display: "inline-block"}}>Results</h1>
                        {score > 80  ? <h1 style={{color: "green"}}>You got {score}%! Well done!</h1> : <h1 style={{color: "red"}}>You got {score}%. Almost there!</h1>}
                        <button name="exitbutton" onClick={showTestbox}  className='mcselector' style={{background: "#3990FF", color: "white", textAlign: "center"}}>Review Test</button>
                        <Link to={`/cards/${params.userID}/${params.setID}`}>Exit Test</Link>
                    </div>
                    </div>
            )}                
            </div>
        )  
    }
    return (
        <div className="borderlesscard">
            <Helmet>
                <title>Studio: Test</title>
            </Helmet>
            {shown && (
            <div className='overlayblur'>
            <div className='deletecard'>
                <h1 style={{display: "inline-block"}}>Settings</h1>
                <h3 style={{marginTop: "-10px"}}>Answer with:</h3>
                <Select options={option} defaultValue={option[1]} onChange={setFirstValue}/>
                <h3 style={{}}>Answer Type:</h3>
                <Select options={option1} defaultValue={option1[0]} onChange={setAnswerType}/> 
                {/* <button className='signin' onClick={() => deleteCollection()} style={{background: "rgb(190, 35, 35)"}}>Delete</button> */}
            </div>
            </div>
            )}
            {/* <div className="borderlesscard">
                <h1>Select your test </h1>
                <h2>Use the settings below to create your own test.</h2>
                <h3 style={{marginTop: "10px"}}>Answer with:</h3>
                <Select options={option} defaultValue={option[1]} onChange={setFirstValue}/>
                <h3 style={{}}>Answer Type:</h3>
                <Select options={option1} defaultValue={option1[0]} onChange={setAnswerType} style={{zIndex: "999"}}/> 

            </div> */}
        </div>
    )
}