import './Sidebar.css';

interface SidebarProps {
    activeItem: string;
    onItemClick: (item: string) => void;
}

const menuItems = [
    'Configuration',
    'Dictionary',
    'Manage Dictionaries',
];

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
    return (
        <nav className="sidebar">
            <div className="sidebar-content">
                {menuItems.map((item) => (
                    <button
                        key={item}
                        className={`sidebar-item ${activeItem === item ? 'active' : ''}`}
                        onClick={() => onItemClick(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </nav>
    );
}