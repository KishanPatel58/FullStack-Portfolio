import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Landing from "./components/ui/Landing";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import NotFound from "./pages/404/NotFound";
import About from "./pages/About";
import Projects from "./pages/Projects";

const SHOW_LANDING_ANIMATION =
  import.meta.env.VITE_SHOW_LANDING === "true";

const App = () => {
  const [showLanding, setShowLanding] = useState(
    SHOW_LANDING_ANIMATION
  );
  const [homeLoaded, setHomeLoaded] = useState(false);
  return (
    <>
      <Routes>
        {/* Layout */}
        <Route
          path="/"
          element={<Layout />}
        > 
          <Route path="/" element={<Home
            onLoaded={() => setHomeLoaded(true)}
          />} />
          <Route path="/about" element={<About/>} />
          <Route path="/projects" element={<Projects/>} />
        </Route>
        {/* Page not Found */}
        <Route path="*" element={<NotFound />}/>
      </Routes>

      <AnimatePresence>
        {showLanding && (
          <Landing
            homeLoaded={homeLoaded}
            onComplete={() => setShowLanding(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;