import Button from "./PlayerControls/Button";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import { Dispatch, MouseEventHandler, useState, SetStateAction } from "react";

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
      <Button
        className="mx-auto mt-4 w-28 self-start bg-wavgray hover:tracking-wider"
        clickHandler={clickHandler}
      >
        {commenterPubKey ? "LOGGED IN" : "NIP-07 LOGIN"}
      </Button>
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
