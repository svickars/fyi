export default function getColumnGroupings(items, numberOfColumns) {
  const groups = [];
  const minimumPerColumn = Math.floor(items.length / numberOfColumns);

  while (numberOfColumns > 0) {
    let columnItems;
    if (items.length % numberOfColumns >= 1) {
      columnItems = items.splice(0, minimumPerColumn + 1);
    } else {
      columnItems = items.splice(0, minimumPerColumn);
    }

    groups.push(columnItems);
    numberOfColumns = numberOfColumns - 1;
  }

  return groups;
}
