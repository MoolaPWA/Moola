import { CategoryIcon } from "./CategoryIcon";
import { INCOME_FILES, EXPENSE_FILES } from "./iconLists";

interface IconPickerProps {
    type: 'income' | 'expense';
    iconColor: string;
    backgroundColor: string;
    onSelect: (iconPath: string) => void;
}

export function IconPicker({ type, iconColor, backgroundColor, onSelect }: IconPickerProps) {
    const icons = type === 'income' ? INCOME_FILES : EXPENSE_FILES;

    return (
        <div className="grid grid-cols-5 gap-3 max-h-72 overflow-y-auto p-2">
            {icons.map((filename) => {
                const displayPath = `${type}/${filename}`;      // для отображения
                const serverPath = `static/icons/${filename}`;  // для сохранения (формат сервера)
                return (
                    <button
                        key={filename}
                        type="button"
                        onClick={() => onSelect(serverPath)}
                        className="flex items-center justify-center rounded-xl p-1 hover:bg-green-100 transition-colors"
                    >
                        <CategoryIcon
                            iconPath={displayPath}
                            type={type}
                            backgroundColor={backgroundColor}
                            iconColor={iconColor}
                            size={44}
                        />
                    </button>
                );
            })}
        </div>
    );
}