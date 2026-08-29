import { useEffect } from "react";
import GridCanvas from "../components/ui/GridCanvas";
import { UseMyContext } from "../context/MyContext";
import Menu from "../components/ui/Menu";
import Hero from "../sections/Hero";

const Home = ({ onLoaded }) => {
  const {Profile} = UseMyContext();

  useEffect(() => {
    const handleLoad = () => {
      onLoaded?.();
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [onLoaded]);

  return (
    <div className="w-full relative">
      {/* Home content */}
      <GridCanvas />
      {/* Bottom Menu */}
      <Menu />
      <Hero />
    </div>
  );
};

export default Home;