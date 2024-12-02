const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Добавляем маршрут для регистрации пользователя
router.post('/register', async function (req, res) {
  try {
    const { fullName, login, email, password } = req.body;

    // Проверка уникальности логина
    const existingUser = await prisma.user.findUnique({
      where: {
        login: login
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Логин уже занят' });
    }

    // Создание нового пользователя
    const user = await prisma.user.create({
      data: {
        fullName,
        login,
        email,
        password // Рекомендуется добавить хеширование пароля
      }
    });

    res.status(201).json({ ...user });
  } catch (error) {
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({
      error: 'Ошибка при создании заявки',
      details: error.message
    });
  }
});

router.post('/login', async function (req, res) {
  try {
    const { login, password } = req.body;

    // Поиск пользователя по email
    const user = await prisma.user.findUnique({
      where: {
        login: login
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Здесь должна быть проверка пароля (после добавления хеширования)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // В будущем здесь можно добавить генерацию JWT токена
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      login: user.login,
      role: user.role
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка при входе в систему' });
  }
});

module.exports = router;
