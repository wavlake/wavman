const Links: React.FC<{}> = () => (
  <div className="tracking-tightest mx-auto flex flex-col items-center space-y-4 text-xs">
    <div className="hover:tracking-wider">
      <a href={`https://blog.wavlake.com`} target={"_blank"} rel={"noreferrer"}>
        What is this?
      </a>
    </div>
    <div className="hover:tracking-wider">
      <a
        href={`https://github.com/wavlake/wavman`}
        target={"_blank"}
        rel={"noreferrer"}
      >
        Github
      </a>
    </div>
    <div className="hover:tracking-wider">
      <a href={`https://wavlake.com`} target={"_blank"} rel={"noreferrer"}>
        A Wavlake Production
      </a>
    </div>
  </div>
);

export default Links;
