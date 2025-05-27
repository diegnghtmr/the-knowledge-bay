import logo from "../../assets/img/logoAlt.webp";
import registrationImg from "../../assets/img/joinNow.webp";

const Wall = ({ type, image, state }) => {
  if (type === "login") {
    return (
      <aside
        className={`
            flex flex-col justify-between
            box-border
            h-[100%]
            rounded-xl 
            bg-(--sand) 
            transition-all duration-500 ease-in-out 
            ${state ? "opacity-100 z-10" : "opacity-0 z-0"}`}
      >
        <header className="box-border w-full flex flex-col justify-center p-12 text-(--coastal-sea)">
          <p className="text-left">Nos alegra verte de nuevo,</p>
          <h2 className="text-3xl font-workSans-bold text-center">
            ¡Continúa tu viaje con nosotros!
          </h2>
        </header>

        <img
          src={image}
          alt="beach"
          className="max-h-[220px] m-auto mb-[2rem]"
        />
        <Footer />
      </aside>
    );
  } else if (type === "register") {
    return (
      <aside
        className={`
           flex flex-col justify-between
           box-border
           h-full
           rounded-xl bg-(--sand)
           transition-all duration-500 ease-in-out 
           ${!state ? "opacity-100 z-10" : "opacity-0 z-0"}`}
      >
        <header className="w-full flex flex-col justify-center p-12 mb-[0.6rem] text-(--coastal-sea)">
          <h2 className="text-3xl font-workSans-bold text-left">
            ¡Únete hoy mismo!
          </h2>
          <p className="text-center opacity-90 ">
            Comienza tu aventura hoy. Únete a nuestra comunidad y explora con
            nosotros.
          </p>
        </header>

        <img
          src={registrationImg}
          className="max-h-[200px] m-auto mb-[2rem]"
          alt="ilustración de usuarios creando conocimiento"
        ></img>

        <Footer />
      </aside>
    );
  }
};

const Footer = () => {
  return (
    <footer className="flex gap-4 p-4 bg-(--deep-sea) rounded-b-lg">
      <img src={logo} alt="logo" className="h-[2rem] w-auto mt-[0.3rem]" />
      <p className="text-sm text-(--coastal-sea)">
        Conectando mentes,
        <br /> esparciendo el conocimiento.
      </p>
    </footer>
  );
};

export default Wall;
