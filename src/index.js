import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './App.css';
import Create from './Create';
import Home from './Home';
import reportWebVitals from './reportWebVitals';
import Card from './Card';
import Flashcard from './Flashcard';
import Account from './Account';
import Edit from './Edit';
import Test from './Test';
import Learn from './Learn';
import Import from './Import';
import {
  BrowserRouter,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
function PageNotFound() {
  const navigate = useNavigate();
  setTimeout(() => {navigate('/home');}, 3000);
  return (
    <div className='borderlesscard'>
      <h2>404 Page not found</h2>
      <p>You will be redirected soon.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
          <Route path="home" element={<Home />} />
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="create" element={<Create />} />
          <Route path="import" element={<Import />} />
          <Route path="card" element={<Card />}>
            <Route path=":usID/:cardID" element={<Card />}/>
          </Route>
          <Route path="test" element={<Test />}>
            <Route path=":userID/:setID" element={<Test />}/>
          </Route>
          <Route path="flashcard" element={<Flashcard />}>
            <Route path=":userID/:setID" element={<Flashcard />}/>
          </Route>
          <Route path="learn" element={<Learn />}>
            <Route path=":userID/:setID" element={<Learn />}/>
          </Route>
          <Route path="edit" element={<Edit />}>
            <Route path=":usID/:cardID" element={<Edit />}/>
          </Route>
          <Route path="account" element={<Account />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
    </Routes>
  </BrowserRouter>
);
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
