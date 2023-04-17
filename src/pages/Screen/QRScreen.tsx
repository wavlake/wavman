import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const QRScreen: React.FC<{
  paymentRequest: string;
}> = ({ paymentRequest = "" }) => {
  const [qrImage, setQrImage] = useState<string | undefined>();
  useEffect(() => {
    if (paymentRequest.length === 0) return;
    QRCode.toDataURL(`lightning:${paymentRequest}`)
      .then((img) => setQrImage(img))
      .catch((e) => console.log(`${e}`));
  }, [paymentRequest]);

  const clickHandler = () => {
    navigator.clipboard.writeText(paymentRequest);
  };

  return (
    <div className="mt-1 flex h-44 place-content-center">
      {paymentRequest.length ? (
        <div className="mx-auto hover:cursor-pointer hover:opacity-70">
          <img
            src={qrImage}
            height={180}
            width={180}
            onClick={clickHandler}
            onTouchStart={clickHandler}
          />
          <div className="mx-auto flex justify-center text-xs">Tap to copy</div>
        </div>
      ) : (
        "Loading QR Code..."
      )}
    </div>
  );
};

export default QRScreen;
