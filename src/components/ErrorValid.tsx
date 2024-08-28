import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type messageError = {
  message: string;
};

export default function ErrorValid({ message }: messageError) {
  return (
    <div className="text-white font-bold uppercase bg-red-600 mt-2 p-3 text-center">
      <FontAwesomeIcon icon={faCircleExclamation} /> {message}
    </div>
  );
}
