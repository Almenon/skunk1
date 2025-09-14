export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log('Hello popsicles!');
    const word_replacements: {[key: string]: string} = {
      'robot': '机器人',
      'worker': '工人',
      'workers': '工人',
      'write': '写'
    }
    const iterationMax = 30000 // arbitrary, I just want to at least cover first page

    /**
     * Take a node and return the split version for processing later
     * @returns null if no match in node
     */
    function findMatch(node: Node) {
      if(node.textContent){
        // todo split on all whitespace /\s+/
        const words = node.textContent.split(" ")
        const result: string[] = []
        let wordsSoFar = ""
        words.forEach((word)=>{
          if(word in word_replacements){
            result.push(wordsSoFar)
            result.push(word)
            wordsSoFar = ""
          } else {
            wordsSoFar += word + " "
          }
        })

        if(result.length == 0){
          return null
        }
        return [node, result]
      }
    }

    function createReplacementElement(word_to_replace: string){
      const aElement = document.createElement('a');
      const word_replacement = word_replacements[word_to_replace]
      aElement.textContent = word_replacement;
      aElement.href = "https://www.dong-chinese.com/dictionary/search/" + word_replacement
      return aElement
    }

    function replaceTextInNode(match: [Node,string[]]) {
      let node = match[0]

      const parent = node.parentNode;
      if (parent) {
        const parts = match[1]
        parent.removeChild(node);
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] in word_replacements) {
            parent.appendChild(createReplacementElement(parts[i]));
          }
          else {
            parent.appendChild(document.createTextNode(parts[i]));
          }
        }
      }
    }

    let index = 0
    const body = document.querySelector("body")
    const matches: any[] = []
    if (body != null) {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
      for (index = 0; walker.nextNode(); index++) {
        if (index > iterationMax) {
          console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.")
          break
        };

        let match = findMatch(walker.currentNode)
        if(match) matches.push(match)
      }
    }
    else {
      console.warn("document does not have a body. Exiting")
    }

    console.log(`Finished scanning webpage. Scanned ${index} elements`);
    console.log('replacing target elements')
    console.log(matches)
    matches.forEach(replaceTextInNode)
  },
});
