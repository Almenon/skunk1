export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log('Hello popsicles!');
    const word_replacements = {
      'robot': '机器人'
    }
    const word_to_replace = 'robot'
    const iterationMax = 30000 // arbitrary, I just want to at least cover first page

    function findMatchingNode(node: Node) {
      if (node.textContent && node.textContent.includes(word_to_replace)) {
        console.log(`found ${word_to_replace}`)
        return node
      }
    }

    function replaceTextInNode(node: Node) {
      const textContent = node.textContent as string;

      // Create a new paragraph element
      const aElement = document.createElement('a');
      const word_replacement = word_replacements[word_to_replace]
      aElement.textContent = word_replacement;
      aElement.href = "https://www.dong-chinese.com/dictionary/search/" + word_replacement

      // Replace the text with HTML structure
      const parent = node.parentNode;
      if (parent) {
        const parts = textContent.split(word_to_replace);
        console.log(parts)

        // Remove the original text node
        parent.removeChild(node);

        // Add text parts and replacement elements
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            parent.appendChild(document.createTextNode(parts[i]));
          }
          if (i < parts.length - 1) {
            parent.appendChild(aElement.cloneNode(true));
          }
        }
      }
    }

    let index = 0
    const body = document.querySelector("body")
    const matchingNodes: Node[] = []
    if (body != null) {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
      for (index = 0; walker.nextNode(); index++) {
        if (index > iterationMax) {
          console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.")
          break
        };

        let node = findMatchingNode(walker.currentNode)
        if(node) matchingNodes.push(node)
      }
    }
    else {
      console.warn("document does not have a body. Exiting")
    }

    console.log(`Finished scanning webpage. Scanned ${index} elements`);
    console.log('replacing target elements')
    matchingNodes.forEach(replaceTextInNode)
  },
});
