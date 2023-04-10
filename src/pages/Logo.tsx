import Image from "next/image";
const Logo: React.FC<{}> = () => (
  <div className="mx-auto flex justify-center space-x-2">
    <div className="">
      <Image className="h-8" src={"icon.svg"} alt="logo" />
    </div>
    <div className="text-3xl tracking-tighter">WAVMAN</div>
  </div>
);

export default Logo;
