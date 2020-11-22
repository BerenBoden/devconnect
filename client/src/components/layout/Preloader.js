import React from "react";
import spinner from "./spinner.gif";

const Preloader = () => {
  return (
    <div>
      <img
        src={spinner}
        alt="loading..."
        style={{ width: "80px", margin: "auto", display: "block" }}
      />
    </div>
  );
};

export default Preloader;
