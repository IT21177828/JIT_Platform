import React from "react";
import "./Loading.css";
export default function Loading() {
  return (
    <>
      <div className="fixed dark:bg-blue-100 opacity-60 bg-blue-400 h-[100vh] w-[100vw] flex justify-center items-center">
        <div className="loading-wave z-30">
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
        </div>
      </div>
    </>
  );
}
