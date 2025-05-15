import { useState, useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import AuthComponent from "../components/auth/Auth.jsx";
// Assets
import Logo from "../assets/img/logo.webp";
import beach from "../assets/img/beach.webp";

const scrollToTopSmooth = (duration = 2000, multiplier = 1) => {
  const start = window.scrollY;
  const targetScroll = Math.max(start - window.innerHeight * multiplier, 0);
  const startTime = performance.now();

  const animateScroll = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 2); // easing: easeOutQuad

    const currentScroll = start - (start - targetScroll) * ease;
    window.scrollTo(0, currentScroll);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState("login");

  const handleAuthShow = (type) => {
    setAuthType(type);
    setShowAuth(true);
  };

  useEffect(() => {
    if (location.pathname === "/register") {
        handleAuthShow("register");
        scrollToTopSmooth(2300, 1);
    } else if (location.pathname === "/login") {
        handleAuthShow("login");
        scrollToTopSmooth(2300, 1);
    } else {
      window.scrollTo(0, document.body.scrollHeight);
      setTimeout(() => {
        scrollToTopSmooth(2300);
      }, 500);
    }
  }, []);

  return (
    <main className="flex flex-col justify-between bg-linear-to-t from-10% from-(--open-sea) to-(--coastal-sea)">
      <section className="h-dvh flex flex-col gap-4 justify-center items-center bg-linear-to-t from-10% from-(--sand) to-white"></section>
      <article className="h-dvh flex flex-col gap-4 justify-center items-center">
        <div className="w-full">
          <img
            src={beach}
            alt="beach"
            className="w-[2000px] h-auto absolute top-[100vh]"
          />
        </div>
        <header className="flex flex-col items-center justify-center mb-30">
          <img src={Logo} alt="logo" className="w-1/2 h-auto mb-14" />
          <p className="text-xl text-(--sand) text-center max-w-[390px]">
            Una red social educativa donde compartir, aprender y conectar es
            solo el comienzo.
          </p>
        </header>
        <nav className="z-10">
          <button
            onClick={() => {
              scrollToTopSmooth(1500, 2);
              setTimeout(() =>
              {
                handleAuthShow("register");
                navigate("/register");
              }, 1500);
            }}
            className="bg-(--coastal-sea) hover:bg-(--sand) text-white hover:text-[var(--deep-sea)] font-workSans-bold py-3 px-6 rounded-2xl shadow-lg transition duration-300 mr-7"
          >
            ¡Unirse ahora!
          </button>
          <button
            onClick={() => {
              scrollToTopSmooth(1500, 2);
              setTimeout(() => {
                handleAuthShow("login");
                navigate("/login");
              }, 1500);
            }}
            className="border border-(--sand) hover:bg-[var(--sand)] text-[var(--sand)] hover:text-[var(--deep-sea)] font-workSans-bold py-3 px-6 rounded-2xl transition duration-300"
          >
            Ya tengo cuenta
          </button>
        </nav>
        <AuthComponent isVisible={showAuth} initialView={authType} />
      </article>
      <section className="h-dvh text-white flex flex-col items-center justify-center px-6 py-12 text-center relative">
        <svg
          className="waves absolute bottom-0 left-0 right-0 h-[cacl(100vh+300px)] w-full z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 70 60"
          preserveAspectRatio="xMidYMid slice"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use href="#gentle-wave" x="48" y="10" fill="#1C1F214D" />
            <use href="#gentle-wave" x="48" y="20" fill="#1C1F2180" />
            <use href="#gentle-wave" x="48" y="35" fill="#1C1F21" />
          </g>
        </svg>
      </section>
    </main>
  );
};

export default Landing;
