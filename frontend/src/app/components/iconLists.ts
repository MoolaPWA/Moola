// Списки имён файлов иконок по типам.
// Используются в IconPicker (отображение сетки) и CategoryIcon (валидация пути).

export const INCOME_FILES = [
    'badge-dollar-sign.svg', 'badge-tm.svg', 'boxicons--crypto.svg', 'briefcase.svg',
    'businessplan.svg', 'chalkboard-teacher.svg', 'chart-column-increasing.svg', 'chat-bubble.svg',
    'circle-dollar-sign.svg', 'copyright.svg', 'ellipsis.svg', 'ep--promotion.svg',
    'fluent--reward-12-filled.svg', 'fluent--wallet-32-filled.svg', 'fluent-mdl2--streaming.svg', 'gift.svg',
    'hugeicons--auction.svg', 'hugeicons--cashback.svg', 'hugeicons--promotion.svg', 'hugeicons--teaching.svg',
    'iconamoon--music-1-fill.svg', 'iconoir--design-pencil.svg', 'iconoir--microphone-speaking-solid.svg', 'link.svg',
    'material-symbols--artist.svg', 'material-symbols--contract.svg', 'material-symbols--monetization-on.svg', 'mdi--art.svg',
    'mdi--donation.svg', 'mdi--exchange.svg', 'mdi--marketplace.svg', 'mdi--patreon.svg',
    'mdi--speaking.svg', 'mdi--twitch.svg', 'mdi--typewriter.svg', 'mdi--youtube.svg',
    'ri--ai.svg', 'rotate-rectangle.svg', 'shield-user.svg', 'simple-icons--freelancer.svg',
    'streamline-sharp--startup.svg', 'streamline-sharp--user-work-laptop-wifi.svg',
    'streamline-ultimate--corporate-social-media.svg', 'streamline-ultimate--crypto-currency-bitcoin-dollar-exchange-bold.svg',
    'tabler--affiliate.svg', 'tabler--exchange.svg', 'tabler--photo-alt.svg', 'tag.svg',
    'tip-jar.svg', 'wallet.svg', 'wpf--statistics.svg',
];

export const EXPENSE_FILES = [
    'baby.svg', 'badge-plus.svg', 'brand-netflix.svg', 'bus.svg',
    'car-taxi-front.svg', 'car.svg', 'circle-alert.svg', 'coffee.svg',
    'dumbbell.svg', 'ep--dessert.svg', 'flip-flops.svg', 'fluent-mdl2--breakfast.svg',
    'fuel.svg', 'gamepad-2.svg', 'gift.svg', 'graduation-cap.svg',
    'gravity-ui--books.svg', 'hamburger.svg', 'hammer.svg', 'hanger.svg',
    'house.svg', 'icon-park--hair-brush.svg', 'icon-park-outline--dog.svg', 'ion--beer.svg',
    'lamp.svg', 'mailbox.svg', 'map--bakery.svg', 'masks-theater.svg',
    'material-symbols--camping.svg', 'material-symbols--car-repair.svg', 'material-symbols--casino.svg', 'material-symbols--cleaning.svg',
    'material-symbols--construction.svg', 'mdi--bike.svg', 'mdi--car-wash.svg', 'mdi--charity.svg',
    'mdi--dentist.svg', 'microphone-2.svg', 'monitor.svg', 'parking-circle.svg',
    'paw-print.svg', 'pill.svg', 'plane.svg', 'printer.svg',
    'receipt.svg', 'scissors.svg', 'shield.svg', 'shirt.svg',
    'shoe.svg', 'shopping-bag.svg', 'shopping-cart.svg', 'smartphone.svg',
    'solar--delivery-bold.svg', 'sparkles.svg', 'streamline-ultimate--concert-dj.svg', 'wine.svg',
    'wrench.svg',
];

export const SYSTEM_ICON_MAP: Record<string, string> = {
    // Расходы
    'entertainment.svg': 'masks-theater.svg',   // Развлечения
    'health.svg': 'pill.svg',                    // Здоровье
    'groceries.svg': 'shopping-cart.svg',        // Продукты
    'shopping.svg': 'shopping-bag.svg',          // Покупки
    'education.svg': 'graduation-cap.svg',       // Образование
    'transport.svg': 'bus.svg',                  // Транспорт
    'other.svg': 'badge-plus.svg',               // Другое
    // Доходы
    'investments.svg': 'chart-column-increasing.svg', // Инвестиции
    'salary.svg': 'wallet.svg',                  // Зарплата
    'freelance.svg': 'briefcase.svg',            // Фриланс
};