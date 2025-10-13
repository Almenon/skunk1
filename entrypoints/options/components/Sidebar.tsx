import './Sidebar.css';

interface SidebarProps {
    activeItem: string;
    onItemClick: (item: string) => void;
}

const menuItems = [
    { id: 'configuration', label: 'Configuration' },
    { id: 'dictionary', label: 'Dictionary' },
    { id: 'manage-dictionaries', label: 'Manage Dictionaries' },
];

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
    return (
        <nav className="sidebar">
            <div className="sidebar-content">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                        onClick={() => onItemClick(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}