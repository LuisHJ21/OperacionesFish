type props = {
  img: string;
};
export default function NetState({ img }: props) {
  return (
    <>
      <div className=" w-screen h-screen bg-gray-800 flex justify-center items-center fixed">
        <div className="md:w-1/2 lg:w-1/3 ">
          <img src={img} alt="" className="w-full" />
          {/*  <h1 className="text-center font-bold text-red-800">
              NO HAY CONEXION A A LA RED
            </h1> */}
        </div>
      </div>
    </>
  );
}
