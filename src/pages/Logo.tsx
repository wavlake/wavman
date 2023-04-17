const Logo: React.FC<{}> = () => (
  <div className="mx-auto my-2 flex items-center justify-center space-x-2">
    <div className="">
      <img className="h-8" src="icon.svg" alt="logo" />
    </div>
    <div className="text-3xl tracking-tighter">WAVMAN</div>
  </div>
);

export default Logo;
