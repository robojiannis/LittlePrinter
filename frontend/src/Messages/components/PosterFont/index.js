import * as React from "react";

import MessageInput from "../MessageInput";
import Header from "./Header";
import Preview from "./Preview";
import useTime from "./useTime";
import domtoimage from "dom-to-image";

async function generateImageFromPreview(ref) {
  if (ref.current) {
    try {
      return await domtoimage.toBlob(ref.current);
    } catch (err) {
      console.error("Error generating image", err);
    }
  }
}

export default function ({ onSend, owner }) {
  const [message, setMessage] = React.useState("");
  const ref = React.createRef();

  const handleSend = async function () {
    const image = await generateImageFromPreview(ref);
    onSend({ type: "poster-font", image });
  };

  // const handleSend = function () {
  //   if (!message.trim()) return;
  //   onSend({ type: "poster-font", text: message.trim() });
  // };

  const time = useTime();

  return (
    <div>
      <Preview
        ref={ref}
        text={message}
        header={<Header time={time} />}
      />
      <div className="is-keyboard-accessory">
        <MessageInput message={message} onChange={setMessage} onSend={handleSend} />
      </div>
    </div>
  );
}
