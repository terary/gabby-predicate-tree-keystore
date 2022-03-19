const delimiter = ":";
const keys = [
  "root:0:0",
  "root:0:0:1",
  "root:0:0:1:0",
  "root:0:0:1:1",
  "root:0:0:1:2",
  "root:0:0:1:3",
  "root:0:0:2:0",
  "root:0:0:2:2",
  "root:0:1",
  "root:0:1:0",
  "root:0:1:1",
  "root:0:1:2",
  "root:0:2",
  "root:1:0",
  "root:1:2",
  "root:1:2",
  "root:2",
];

const descendantsRegExpFn = (nodeId: string) => new RegExp(`^${nodeId}${delimiter}`);
const childrenRegExpFn = (nodeId: string) => new RegExp(`^${nodeId}${delimiter}[\\d]+\$`);

const getChildren = (parent: string) => {
  const childRegEx = childrenRegExpFn(parent);

  return keys.filter((key) => childRegEx.test(key));
};

const getDescendants = (parent: string) => {
  const childRegEx = descendantsRegExpFn(parent);
  return keys.filter((key) => childRegEx.test(key));
};

const parent = "root:0:0:1";

const children = getChildren(parent);
console.log(`Children "${parent}":`);
children.forEach((childId) => console.log(`\t${childId}`));

const descendants = getDescendants(parent);
console.log(`\nDescendants "${parent}":`);
descendants.forEach((childId) => console.log(`\t${childId}`));

const getSiblingIds = (childId: string) => {
  const parent = childId.split(delimiter).slice(0, -1).join(delimiter);
  const children = getChildren(parent);
  return children.filter((child) => child !== childId);
};
const siblings = getSiblingIds("root:0:0:1:1");
console.log("siblings:", siblings);
