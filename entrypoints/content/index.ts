export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log('Hello popsicles!');
    const word_replacements = {
      'robot': '机器人'
    }
    const word_to_replace = 'robot'
    const iterationMax = 30000 // arbitrary, I just want to at least cover first page

    function replaceTextInNode(node: Node) {
      const textContent = node.textContent;
      if (textContent && textContent.includes(word_to_replace)) {
        console.log(`replacing ${word_to_replace} in ${node.nodeName}`)
        node.textContent = textContent.replaceAll(word_to_replace, word_replacements[word_to_replace])
      }
    }

    let index = 0
    const body = document.querySelector("body")
    if(body != null){
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
      for (index = 0; walker.nextNode(); index++) {
        if (index > iterationMax){
          console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.")
          break
        };

        replaceTextInNode(walker.currentNode)
      }
    }
    else {
      console.warn("document does not have a body. Exiting")
    }

    console.log(`Finished scanning webpage. Scanned ${index} elements`);
  },
});
