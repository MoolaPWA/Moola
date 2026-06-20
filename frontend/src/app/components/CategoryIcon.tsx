import { INCOME_FILES, EXPENSE_FILES, SYSTEM_ICON_MAP } from "./iconLists";

interface CategoryIconProps {
    iconPath: string;
    type: 'income' | 'expense';
    backgroundColor: string;
    iconColor: string;
    size?: number;
}

export function CategoryIcon({
                                 iconPath,
                                 type,
                                 backgroundColor,
                                 iconColor,
                                 size = 48,
                             }: CategoryIconProps) {
    const filename = iconPath ? iconPath.split('/').pop()! : '';

    const defaultFile = type === 'expense' ? 'badge-plus.svg' : 'badge-dollar-sign.svg';
    const knownIcons = type === 'income' ? INCOME_FILES : EXPENSE_FILES;

    // Определяем итоговый файл:
    // 1) если имя есть в нашем наборе — берём его
    // 2) если это системная иконка — берём из маппинга
    // 3) иначе дефолт
    let finalFile: string;
    if (filename && knownIcons.includes(filename)) {
        finalFile = filename;
    } else if (filename && SYSTEM_ICON_MAP[filename]) {
        finalFile = SYSTEM_ICON_MAP[filename];
    } else {
        finalFile = defaultFile;
    }

    const url = `/icons/categories/${type}/${finalFile}`;

    return (
        <div
            className="rounded-xl flex items-center justify-center shrink-0"
            style={{ width: size, height: size, backgroundColor }}
        >
            <div
                style={{
                    width: size * 0.55,
                    height: size * 0.55,
                    backgroundColor: iconColor,
                    maskImage: `url(${url})`,
                    WebkitMaskImage: `url(${url})`,
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                }}
            />
        </div>
    );
}