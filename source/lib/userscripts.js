var userscripts = [
    {
        id: "commentratingfont",
        name: "Шрифт рейтинга комментариев",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru\/comments\/.+/,
        filename: "commentratingfont.js"
    },
    {
        id: "eblozory",
        name: "Еблозорий",
        description: "",
        include: /http:\/\/(www\.)?leprosorium\.ru\/users\/.+/,
        filename: "eblozory.js"
    },
    {
        id: "youtube",
        name: "Просмотр YouTube видео",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru.*/,
        filename: "youtube.js"
    },
    {
        id: "transparentimages",
        name: "Полупрозрачные картинки",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru.*/,
        filename: "transparentimages.js"
    },
    {
        id: "preview",
        name: "Предварительный просмотр",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru\/(comments\/\d+|my\/inbox\/\d+)/,
        filename: "preview.js"
    },
    {
        id: "newcomments",
        name: "Навигация по новым комментариям",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru\/(comments\/.+|my\/inbox\/.+)/,
        filename: "newcomments.js"
    },
    {
        id: "totalcomments",
        name: "Total Comments",
        description: "",
        include: /http:\/\/([a-zA-Z0-9]+\.)?leprosorium\.ru\/comments\/.+/,
        filename: "totalcomments.js"
    }
];

exports.userscripts = userscripts;