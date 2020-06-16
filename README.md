# Фронтенд
Этот проект представляет из себя SPA на **react** с использование **react router**. 
В качестве хранилища данных я использовал механизм **useContext**.

https://github.com/hino-2/corona-v-shop

# Бэкенд
Бэкенд сделан на **express.js** фреймворке.
Бэкенд дает методы для регистрации пользоватей, авторизации, регистрации заказов etc. 
Пользователи и заказы просто хранятся в переменных в памяти сервера. 
Авторизация выполняется с использование библиотеки **passport.js**, а все пароли хешируются с помощью **bcrypt**.

# Оптимизация
Я перевел хранение всех изображений на **Cloudinary**. Они запрашиваются оттуда сразу с нужными размерами и нужным качеством.
При отображении списка продуктов используется библиотека **react-lazyload**.
Это сократило размер данных при начальной загрузке приложения (js + css + картинки) с 10 МБ до 500+ КБ.
Тесты PageSpeed Insights:
1. Для мобильных: 91/100
2. Для настольных: 98/100

# Установка
1. Скачать фронтенд
2. Выполнить npm install
3. Выполнить npm run build
4. Скачать бэкенд
5. Выполнить npm install
6. Закинуть файлы из папки build из фронтенда в папку с бэкендом
7. Выполнить npm start
8. Сервер будет по адресу http://localhost:3001
9. 🤞

Заходить нужно строго на 'localhost:3001', иначе виджет Почты не будет работать из-за ограничений доступа на стороне Почты.

