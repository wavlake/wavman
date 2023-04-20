import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const QRScreen: React.FC<{
  paymentRequest: string;
}> = ({ paymentRequest = "" }) => {
  const [qrImage, setQrImage] = useState<string | undefined>();
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (paymentRequest.length === 0) return;
    // same color value as wavgreen, which is set in tailwind.config.js
    QRCode.toDataURL(`lightning:${paymentRequest}`, {
      color: { dark: "#000000", light: "#96f9d4" },
    })
      .then((img) => setQrImage(img))
      .catch((e) => console.log(`${e}`));
  }, [paymentRequest]);

  const clickHandler = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(paymentRequest);
  };

  return (
    <div className="flex h-36 place-content-center">
      {qrImage ? (
        <div className="mx-auto hover:cursor-pointer hover:opacity-70">
          {qrImage && (
            <Image
              src={qrImage}
              height={160}
              width={160}
              onClick={clickHandler}
              onTouchStart={clickHandler}
              alt={`QR Code for ${paymentRequest}`}
            />
          )}
          <div className="mx-auto flex justify-center text-xs">
            {isCopied ? "Copied" : "Tap to copy"}
          </div>
        </div>
      ) : (
        "Loading QR Code..."
      )}
    </div>
  );
};

export default QRScreen;
