import { Dispatch, MouseEventHandler, useState, SetStateAction } from 'react'
import { Dialog } from '@headlessui/react'
import Button from './PlayerControls/Button';

const Nip07InfoModal: React.FC<{
  setCommenterPubKey: Dispatch<SetStateAction<string | undefined>>;
  commenterPubKey?: string;
}> = ({ setCommenterPubKey, commenterPubKey }) => {
  let [isOpen, setIsOpen] = useState(false)

  const clickHandler: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const pubKey = await window.nostr?.getPublicKey?.()
      if (pubKey) {
        setCommenterPubKey(pubKey);
        return;
      }
    } catch (e) {
      console.error(e)
    }

    setIsOpen(!isOpen)
  }

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
        <Dialog.Panel>
          <Dialog.Title>NIP-07</Dialog.Title>
          <Dialog.Description>
            Looks like you don't have a NIP-07 extension installed. On mobile? Try this on a desktop browser with a extension like Alby installed. Read more about NIP-07 here https://github.com/nostr-protocol/nips/blob/master/07.md
            <Button
              className="mx-auto mt-4 w-28 self-start bg-wavgray hover:tracking-wider"
              clickHandler={() => setIsOpen(false)}
            >
              OK
            </Button>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </>
  )
};

export default Nip07InfoModal;