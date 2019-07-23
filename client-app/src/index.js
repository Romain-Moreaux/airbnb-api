import React from "react";
import ReactDOM from "react-dom";
import "./style.css";
import * as serviceWorker from "./serviceWorker";

import MainSection from "./components/MainSection";
import Header from "./components/Header";
import Footer from "./components/Footer";

class App extends React.Component {
  render = () => {
    return (
      <div className="page">
        <Header />
        <MainSection />
        <Footer />
      </div>
    );
  };
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
