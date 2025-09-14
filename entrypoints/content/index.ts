export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log('Hello popsicles!');
    const header = document.querySelector('#VPContent > div > div.VPHero.has-image.VPHomeHero > div > div.main > h1')
    if(header){
      header.textContent = "popsicles"
    }
  },
});
