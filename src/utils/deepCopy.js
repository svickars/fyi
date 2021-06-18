export default function deepCopy(array) {
  return JSON.parse(JSON.stringify(array));
}
