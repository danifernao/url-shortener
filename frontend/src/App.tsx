import Form from "./components/Form";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faLink, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";

library.add(faLink, faWandMagicSparkles);

function App() {
  return (
    <>
      <h1>Acortador de URL</h1>
      <Form />
    </>
  );
}

export default App;
