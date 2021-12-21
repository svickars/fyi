export default function stringToHTML(str) {
  // If DOMParser is supported, use it
  if (isSupported()) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body;
  }

  // Otherwise, fallback to old-school method
  let dom = document.createElement("div");
  dom.innerHTML = str;
  return dom;
}

function isSupported() {
  if (!window.DOMParser) return false;
  let parser = new DOMParser();
  try {
    parser.parseFromString("x", "text/html");
  } catch (err) {
    return false;
  }
  return true;
}
