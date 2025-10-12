import extensions_button from '@/assets/extensions_button.png';
import extension_icon from '@/public/wxt.svg';

export default function TutorialPage2() {
    return (
        <div className="tutorial-page">
            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">1</span>
                    <span className="step-text">Click on the <img src={extensions_button}></img> and then <img src={extension_icon}></img> to adjust which words to replace</span>
                </h2>
            </div>

            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">2</span>
                    <span className="step-text">You're done!</span>
                </h2>
            </div>
        </div >
    );
}