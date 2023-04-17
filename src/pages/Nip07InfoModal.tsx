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
      // show modal if pubKey code above is undefined
      setIsOpen(!isOpen)
    } catch (e) {
      // don't show modal if user rejects the NIP-07 extension's prompt
      console.error(e)
    }
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
        <div className="fixed inset-0 bg-black/30" aria-hidden="true">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded bg-white">
              <Dialog.Title>NIP-07</Dialog.Title>
              <Dialog.Description>
                Looks like you don't have a NIP-07 extension installed. On mobile? Try this on a desktop browser with a extension like Alby installed. Read more about NIP-07 here https://github.com/nostr-protocol/nips/blob/master/07.md
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
  )
};

export default Nip07InfoModal;