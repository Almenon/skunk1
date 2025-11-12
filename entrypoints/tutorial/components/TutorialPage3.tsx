import extensions_button from '@/assets/extensions_button.png';
import extension_icon from '@/public/wxt.svg';
import './TutorialPage3.css';

export default function TutorialPage3() {
    return (
        <div className="tutorial-page">
            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">1</span>
                    <span className="step-text">Click on <img src={extensions_button}></img> in the top right of your browser
                        and then <img src={extension_icon}></img> to adjust which words to replace</span>
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