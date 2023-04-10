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
  }

  return (
    <div className="m-4 justify-self-center">
      {paymentRequest.length ? (
        <img src={qrImage} height={300} width={300} onClick={clickHandler} onTouchStart={clickHandler} />
      ) : "Loading QR Code..."}
    </div>
  );
};

export default QRScreen;
