import { useState } from 'react';
import TutorialPage1 from './components/TutorialPage1.tsx';
import TutorialPage2 from './components/TutorialPage2.tsx';

export default function App() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 2;

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

    const closeTutorial = () => {
        // Close the tutorial tab
        window.close();
    };

    return (
        <div className="tutorial-container">
            <div className="tutorial-header">
                <h1>Welcome to Word Replacer!</h1>
                <p>Let's get you started with a quick tutorial</p>
            </div>

            <div className="tutorial-content">
                {currentPage === 1 && <TutorialPage1 />}
                {currentPage === 2 && <TutorialPage2 />}
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
                        <button className="nav-button" onClick={nextPage}>
                            Next
                        </button>
                    ) : (
                        <button className="nav-button" onClick={closeTutorial}>
                            Get Started!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}