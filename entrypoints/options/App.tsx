import { useState } from 'react';
import './App.css';
import { Sidebar } from './components';
import { ConfigurationPage, DictionaryPage, ManageDictionariesPage } from './pages';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('dictionary');

  const renderPage = () => {
    switch (activeMenuItem) {
      case 'configuration':
        return <ConfigurationPage />;
      case 'dictionary':
        return <DictionaryPage />;
      case 'manage-dictionaries':
        return <ManageDictionariesPage />;
      default:
        return <DictionaryPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={setActiveMenuItem}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;