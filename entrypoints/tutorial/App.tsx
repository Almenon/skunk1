import { useState } from 'react';
import TutorialPage1 from './components/TutorialPage1.tsx';
import TutorialPage2 from './components/TutorialPage2.tsx';
import TutorialPage3 from './components/TutorialPage3.tsx';

export default function App() {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLanguageSelected, setIsLanguageSelected] = useState(false);
    const totalPages = 3;

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const openOptions = () => {
        document.location = browser.runtime.getURL('/options.html');
    };

    return (
        <div className="tutorial-container">
            <div className="tutorial-header">
                <h1>Welcome to Word Replacer!</h1>
            </div>

            <div className="tutorial-content">
                {currentPage === 1 && (
                    <TutorialPage1
                        onLanguageSelected={setIsLanguageSelected}
                    />
                )}
                {currentPage === 2 && <TutorialPage2 />}
                {currentPage === 3 && <TutorialPage3 />}
            </div>

            <div className="tutorial-navigation">
                <div className="page-indicator">
                    Page {currentPage} of {totalPages}
                </div>

                <div>
                    {currentPage > 1 && (
                        <button
                            className="nav-button secondary"
                            onClick={prevPage}
                            style={{ marginRight: '10px' }}
                        >
                            Previous
                        </button>
                    )}

                    {currentPage < totalPages ? (
                        <button
                            className={`nav-button ${currentPage === 1 && !isLanguageSelected ? 'disabled' : ''}`}
                            onClick={nextPage}
                            disabled={currentPage === 1 && !isLanguageSelected}
                        >
                            Next
                        </button>
                    ) : (
                        <button className="nav-button" onClick={openOptions}>
                            Get Started!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}