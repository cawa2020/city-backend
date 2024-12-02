const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки фото
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Убедитесь, что папка uploads существует
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'));
    }
  }
});

// Создание новой заявки
router.post('/create', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, photoUrl, userId } = req.body;

    const request = await prisma.request.create({
      data: {
        title,
        description,
        category,
        photoUrl,
        userId: parseInt(userId),
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
});

// Получение всех заявок
router.get('/get_all', async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Получение заявок пользователя
router.get('/my', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    const requests = await prisma.request.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Получение конкретной заявки
router.get('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    res.json(request);
  } catch (error) {
    console.error('Ошибка получения заявки:', error);
    res.status(500).json({ error: 'Ошибка при получении заявки' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);

    // Проверяем существование категории
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    // Обновляем категорию
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: req.body,
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Ошибка обновления заявки:', error);
    res.status(500).json({ error: 'Ошибка при обновлении заявки' });
  }
});

// Обновление статуса заявки
router.patch('/:id/status', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status } = req.body;

    const request = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: {
        status,
      },
    });

    res.json(request);
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// Удаление заявки
router.delete('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    // Можно добавить проверку прав пользователя здесь

    await prisma.request.delete({
      where: {
        id: requestId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления заявки:', error);
    res.status(500).json({ error: 'Ошибка при удалении заявки' });
  }
});

module.exports = router;