import Button from "./PlayerControls/Button";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import { Dispatch, MouseEventHandler, useState, SetStateAction, PropsWithChildren } from "react";

const BorderButton: React.FC<PropsWithChildren<{
  clickHandler: MouseEventHandler<HTMLButtonElement>;
}>> = ({ children }) => (
  <div className="mx-auto mt-4 w-[22rem] h-14 relative grid">
    <Button className="p-1 self-start bg-wavgray hover:tracking-wider border-8 border-black">
      {children}
    </Button>
    {/* <div className="absolute left-0 top-0 h-2 w-2 bg-black"></div>
    <div className="absolute right-0 top-0 h-2 w-2 bg-black"></div>
    <div className="absolute bottom-0 left-0 h-2 w-2 bg-black"></div>
    <div className="absolute bottom-0 right-0 h-2 w-2 bg-black"></div>
    <div className="absolute -left-2 -top-2 h-2 w-2 bg-wavpink"></div>
    <div className="absolute -right-2 -top-2 h-2 w-2 bg-wavpink"></div>
    <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-wavpink"></div>
    <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-wavpink"></div> */}
  </div>
)
const Nip07InfoModal: React.FC<{
  setCommenterPubKey: Dispatch<SetStateAction<string | undefined>>;
  commenterPubKey?: string;
}> = ({ setCommenterPubKey, commenterPubKey }) => {
  let [isOpen, setIsOpen] = useState(false);

  const clickHandler: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const pubKey = await window.nostr?.getPublicKey?.();
      if (pubKey) {
        setCommenterPubKey(pubKey);
        return;
      }
      // show modal if pubKey code above is undefined
      setIsOpen(!isOpen);
    } catch (e) {
      // don't show modal if user rejects the NIP-07 extension's prompt
      console.error(e);
    }
  };

  // if (commenterPubKey) return <></>;

  return (
    <>
      <BorderButton clickHandler={clickHandler}>
        {commenterPubKey ? "LOGGED IN" : "NIP-07 LOGIN"}
      </BorderButton>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-2">
              <Dialog.Title className="pb-4 text-center">NIP-07</Dialog.Title>
              <Dialog.Description className="text-xs">
                {`Looks like you don't have a NIP-07 extension installed. On
                mobile? Try this on a desktop browser with a NIP-07 extension
                (like Alby) installed.`}
                <Link href="https://github.com/nostr-protocol/nips/blob/master/07.md">
                  Click here
                </Link>{" "}
                to read more about NIP-07.
              </Dialog.Description>
              <Button
                className="mx-auto mt-4 w-28 self-start bg-wavgray hover:tracking-wider"
                clickHandler={() => setIsOpen(false)}
              >
                OK
              </Button>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Nip07InfoModal;
