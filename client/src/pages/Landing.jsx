import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthComponent from "../components/auth/Auth.jsx";
import SignupComponent from "../components/auth/Signup.jsx";
// Assets
import Logo from "../assets/img/logo.webp";
import beach from "../assets/img/beach.webp";

const scrollToTopSmooth = (duration = 2000, multiplier = 1) => {
  const start = window.scrollY;
  const targetScroll = Math.max(start - window.innerHeight * multiplier, 0);
  const startTime = performance.now();
  let frame;

  const animateScroll = (currentTime) => {
    const progress = duration === 0 ? 1 : Math.min((currentTime - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 2);
    window.scrollTo(0, start - (start - targetScroll) * ease);
    if (progress < 1) frame = requestAnimationFrame(animateScroll);
  };

  frame = requestAnimationFrame(animateScroll);
  return () => cancelAnimationFrame(frame);
};

const Landing = () => {
  const [data, setData] = useState(null);
  const cancelTransition = useRef(() => {});
  const navigate = useNavigate();
  const { pathname, key } = useLocation();
  const authType = pathname === "/login" ? "login" : "register";

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
    if (pathname === "/landing") {
      const timer = setTimeout(() => {
        cancelTransition.current = scrollToTopSmooth(2300);
      }, 500);
      cancelTransition.current = () => clearTimeout(timer);
    } else {
      cancelTransition.current = scrollToTopSmooth(0, pathname === "/register/steps" ? 3 : 2);
    }
    return () => cancelTransition.current();
  }, [pathname, key]);

  function transitionTo(path, duration = 1500, delay = duration, draft) {
    cancelTransition.current();
    const cancelScroll = scrollToTopSmooth(duration);
    const timer = setTimeout(() => {
      if (draft) setData(draft);
      navigate(path);
    }, delay);
    cancelTransition.current = () => {
      clearTimeout(timer);
      cancelScroll();
    };
  }

  return (
    <main className="flex flex-col justify-between bg-linear-to-t from-10% from-(--open-sea) to-(--coastal-sea)">
      <section className="h-dvh flex flex-col gap-4 justify-center items-center bg-white"></section>
      <SignupComponent data={data} />
      <section className="h-dvh flex flex-col gap-4 justify-center items-center bg-linear-to-t from-10% from-(--sand) to-white"></section>
      <AuthComponent
        isVisible={pathname !== "/landing"}
        initialView={authType}
        onContinue={(duration, draft) => transitionTo("/register/steps", duration, 1600, draft)}
      />
      <article className="h-dvh flex flex-col gap-4 justify-center items-center">
        <div className="w-full">
          <img
            src={beach}
            alt="beach"
            className="w-[2000px] h-auto absolute top-[200vh]"
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
            onClick={() => transitionTo("/register")}
            className="bg-(--coastal-sea) hover:bg-(--sand) text-white hover:text-[var(--deep-sea)] font-workSans-bold py-3 px-6 rounded-2xl shadow-lg transition duration-300 mr-7"
          >
            ¡Unirse ahora!
          </button>
          <button
            onClick={() => transitionTo("/login")}
            className="border border-(--sand) hover:bg-[var(--sand)] text-[var(--sand)] hover:text-[var(--deep-sea)] font-workSans-bold py-3 px-6 rounded-2xl transition duration-300"
          >
            Ya tengo cuenta
          </button>
        </nav>
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
