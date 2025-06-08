const http = fetch;
// const http = (...params) => console.log("HTTP", ...params);

const config = {
  printKey: "llj0vztkg890wcybj3n9",
  apiBase: "https://device.li"
};

function url() {
  return `${config.apiBase}/${config.printKey}`;
}

export function sendText(text) {
  console.log("sendText", text);
  return http(url(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: text
  });
}

export async function sendImage({ url, image, caption }) {
  // Convert image to base64
  console.log("sendImage", url, image, caption);
  const base64Image = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(image);
  });

  // Send as JSON with image and caption
  http(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "image/png"
    },
    body: image
  });
}

export async function getDeviceStatus(url) {
  const response = await http(url);
  const data = await response.json();
  return data;
}
