export function stripLeadingHeadingOne() {
  return (tree) => {
    const firstContentIndex = tree.children.findIndex((node) => node.type !== 'mdxjsEsm');

    if (firstContentIndex === -1) {
      return;
    }

    const firstContentNode = tree.children[firstContentIndex];

    if (firstContentNode.type !== 'heading' || firstContentNode.depth !== 1) {
      return;
    }

    tree.children.splice(firstContentIndex, 1);
  };
}
