import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
//   import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../assets/AppStream.svg";
import admin from "../assets/user-setting.png";
import { loginRequest } from "../../authConfig";
import adminList from "../../adminList";
import image from "../../assets/images/LST.png";
import { useState, useEffect } from "react";
//   import { Spin } from "antd";

const redirectUri: string = import.meta.env.VITE_AZURE_AD_CLIENT_ID!;

export function AuthHome() {
  const { instance, accounts } = useMsal();
  const isAdmin = accounts[0] && adminList.includes(accounts[0]?.username);
  const [loaded, setLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  // **Preload the Image Before Rendering**
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => setLoaded(true);
  }, []);

  const handleLogin = (loginType: string) => {
    if (loginType === "popup") {
      instance.loginPopup({
        ...loginRequest,
        redirectUri: redirectUri,
      });
    } else if (loginType === "redirect") {
      instance.loginRedirect(loginRequest);
    }
  };

  // **Star Tunnel Animation Background**
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 20;
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 15 + 15;
      stars.push(
        <div
          key={i}
          className="stars"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${duration}s`,
          }}
        ></div>
      );
    }
    return stars;
  };

  return (
    <>
      <AuthenticatedTemplate>
        <>Authenticated</>
        {/* <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="absolute top-0 left-0 m-20"
          >
            <RouterLink
              to="/stream-redirect"
              className="px-8 py-6 bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden items-center flex flex-col"
            >
              <img src={Logo} alt="Redirect" width={40} height={40} />
              <span className="font-bold mt-2 text-white">My Stream</span>
            </RouterLink>
          </motion.button> */}
  
          {isAdmin && (
            // <motion.button
            //   initial={{ opacity: 0, y: 20 }}
            //   animate={{ opacity: 1, y: 0 }}
            //   transition={{ duration: 0.2 }}
            //   whileHover={{ scale: 1.02 }}
            //   whileTap={{ scale: 0.98 }}
            //   className="absolute top-0 left-40 m-20"
            // >
            //   <RouterLink
            //     to="/dashboard"
            //     className="px-8 py-6 bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden items-center flex flex-col"
            //   >
            //     <img src={admin} alt="Admin Dashboard" width={40} height={40} />
            //     <span className="font-bold mt-2 text-white">Admin Dashboard</span>
            //   </RouterLink>
            // </motion.button>
            <> Admin</>
          )}
        </AuthenticatedTemplate>
  
        <UnauthenticatedTemplate>
          {/* Star Tunnel Animation Background */}
          <div className="starry-tunnelb">{renderStars()}</div>
  
          {/* Centered Unicorns Facing Each Other */}
          <div className="unicorn-container">
            {/* Left Unicorn */}
            {/* <div className="image w-[500px] h-[500px] opacity-75"> */}
              {/* <motion.img
                src={image}
                alt="Unicorn Right"
                loading="lazy"
                initial={{ opacity: 0, scale: 0.2, y: 30 }}
                animate={{
                  opacity: loaded ? 1 : 0,
                  scale: loaded ? 1 : 0.8,
                  y: loaded ? 0 : 20,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="unicorn transition-transform duration-500 ease-out"
              /> */}
            {/* </div> */}
  
            {/* Right Unicorn (Flipped) */}
            {/* <div className="image w-[500px] h-[500px] scale-x-[-1] opacity-75"> */}
              {/* <motion.img
                src={image}
                alt="Unicorn Right"
                loading="lazy"
                initial={{ opacity: 0, scale: 0.2, y: 30 }}
                animate={
                  loaded
                    ? { opacity: 1, scale: 1, y: 0 }
                    : { opacity: 0, scale: 0.8, y: 30 }
                }
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="unicorn transition-transform duration-500 ease-out"
              /> */}
            {/* </div> */}
          </div>
  
          {/* Login Card */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full px-8 py-6 bg-white bg-opacity-5 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden z-20"
          >
            <h1 className="text-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-500 text-transparent bg-clip-text mb-10">
              Welcome To JIT Platform
            </h1>
            <center className="text-blue-200">
              Please sign in to access your session.
            </center>
  
            <motion.button
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={clicked}
              onClick={(e) => {
                e.preventDefault();
                setClicked(true);
                handleLogin("redirect");
              }}
              className="bg-blue-200 bg-opacity-30 border-1 text-white px-4 py-2 rounded-xl font-semibold w-full mt-8 text-center"
            >
              Sign In {clicked && <Spin />}
            </motion.button>
            </motion.div> */}
        <button
          // transition={{ duration: 0.2 }}
          // whileHover={{ scale: 1.1 }}
          // whileTap={{ scale: 0.9 }}
          // disabled={clicked}
          onClick={(e) => {
            e.preventDefault();
            console.log("Clicked", clicked);
            setClicked(true);
            handleLogin("redirect");
          }}
          className="bg-blue-200 bg-opacity-80 cursor-pointer border-1 text-white px-4 py-2 rounded-xl font-semibold w-full mt-8 text-center z-30"
        >
          Sign In
        </button>
      </UnauthenticatedTemplate>
    </>
  );
}
