/**
 * App.js
 */

 import React from "react";
 
 import {BrowserRouter as Router, Routes, Route } from "react-router-dom"  
 import 'bootstrap/dist/css/bootstrap.min.css'
 import Board from './pages/Board'
 import SearchPage from './pages/SearchPage'


 class App extends React.Component {
  
   render() {
    return (
      <Router>
          <Routes>
            <Route path="/board" element={<Board/>}/>
            <Route index path="/" element={<SearchPage/>}/>
            {/* 👇️ only match this when no other routes match https://bobbyhadz.com/blog/react-router-default-route */}
          <Route
            path="*"
            element={
              <div>
                <h2>404 Page not found</h2>
              </div>
            }
          />
          </Routes>
          
      </Router>
    );
  }
 }

 export default App;