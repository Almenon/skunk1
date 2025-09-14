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
      if(node.nodeType == Node.TEXT_NODE){
        console.log('found text node')
      }
      const textContent = node.textContent;
      if (textContent && textContent.includes(word_to_replace)) {
        console.log(`replacing ${word_to_replace} in ${node.nodeName}`)
        node.textContent = textContent.replaceAll(word_to_replace, word_replacements[word_to_replace])
      }
    }

    const all = document.querySelectorAll("body *")
    for (let index = 0; index < all.length; index++) {
      if (index > iterationMax){
        console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.")
        break
      };

      replaceTextInNode(all[index])
    }
    console.log("Finished scanning webpage");
  },
});
