import QRCode from "qrcode";
import { useEffect, useState } from "react";

const ZapScreen: React.FC<{
  paymentRequest: string;
}> = ({ paymentRequest }) => {
  const [qrImage, setQrImage] = useState<string | undefined>();
  useEffect(() => {
    if (paymentRequest.length === 0) return;
    QRCode.toDataURL(`lightning:${paymentRequest}`)
      .then((img) => setQrImage(img))
      .catch((e) => console.log(`${e}`));
  }, [paymentRequest]);

  return (
    <div className="m-4 justify-self-center">
      {paymentRequest.length ? (
        <img src={qrImage} height={300} width={300} />
      ) : "Loading QR Code..."}
    </div>
  );
};

export default ZapScreen;
