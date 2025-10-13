import { useState } from 'react';
import './App.css';
import { Sidebar } from './components';
import { ConfigurationPage, DictionaryPage, ManageDictionariesPage } from './pages';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('Dictionary');

  const renderPage = () => {
    switch (activeMenuItem) {
      case 'Configuration':
        return <ConfigurationPage />;
      case 'Dictionary':
        return <DictionaryPage />;
      case 'Manage Dictionaries':
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