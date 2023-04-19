interface LinkProps {
  href: string;
  text: string;
}

const Link: React.FC<LinkProps> = ({ href, text }) => {
  return (
    <div className="hover:tracking-wider">
      <a href={href} target={"_blank"} rel={"noreferrer"}>
        {text}
      </a>
    </div>
  );
};

const Links: React.FC<{}> = () => {
  const links: LinkProps[] = [
    {
      href: "https://zine.wavlake.com/introducing-wavman/",
      text: "What is this?",
    },
    { href: "https://github.com/wavlake/wavman", text: "Github" },
    {
      href: "https://snort.social/p/npub1yfg0d955c2jrj2080ew7pa4xrtj7x7s7umt28wh0zurwmxgpyj9shwv6vg",
      text: "Nostr",
    },
    { href: "https://wavlake.com", text: "A Wavlake Production" },
  ];

  return (
    <div className="tracking-tightest mx-auto flex flex-col items-center space-y-4 text-xs">
      {links.map((props, index) => (
        <Link key={index} {...props} />
      ))}
    </div>
  );
};

export default Links;
