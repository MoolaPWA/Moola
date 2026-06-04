#!/bin/bash
set -e

# Определяем ОС
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "darwin";;
        MINGW*|MSYS*|CYGWIN*) echo "windows";;
        *)          echo "unknown";;
    esac
}

OS=$(detect_os)
echo "Обнаружена ОС: $OS"

# Функция установки mkcert на Linux
install_linux() {
    echo "Устанавливаю mkcert на Linux..."
    sudo apt update && sudo apt install -y libnss3-tools curl
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
    chmod +x mkcert-v*-linux-amd64
    sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
}

# Функция установки mkcert на macOS
install_darwin() {
    echo "Устанавливаю mkcert на macOS..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew не установлен. Установите сначала brew: https://brew.sh"
        exit 1
    fi
    brew install mkcert
}

# Функция установки mkcert на Windows (Git Bash)
install_windows() {
    echo "Устанавливаю mkcert на Windows..."
    curl -L -o mkcert.exe https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe
    # Создаём папку ~/bin, если её нет
    mkdir -p "$HOME/bin"
    mv mkcert.exe "$HOME/bin/"
    export PATH="$HOME/bin:$PATH"
    echo "mkcert установлен в ~/bin"
}

# Проверяем, есть ли mkcert уже установлен
if command -v mkcert &> /dev/null || command -v mkcert.exe &> /dev/null; then
    echo "✅ mkcert уже установлен"
else
    echo "mkcert не найден. Устанавливаю..."
    case $OS in
        linux)   install_linux ;;
        darwin)  install_darwin ;;
        windows) install_windows ;;
        *)       echo "Неизвестная ОС. Установите mkcert вручную: https://github.com/FiloSottile/mkcert"; exit 1 ;;
    esac
fi

# Определяем имя команды
if command -v mkcert.exe &> /dev/null; then
    MKCERT_CMD="mkcert.exe"
else
    MKCERT_CMD="mkcert"
fi

# Устанавливаем корневой сертификат
echo "Устанавливаю корневой сертификат..."
$MKCERT_CMD -install

# Создаём папку для сертификатов
mkdir -p certs
cd certs

# Выпускаем сертификаты
echo "Выпускаю сертификаты для localhost и finances.local..."
$MKCERT_CMD localhost finances.local

cd ..
echo "✅ Сертификаты созданы в папке certs/"
echo "   - localhost.pem, localhost-key.pem"
echo "   - finances.local.pem, finances.local-key.pem"