const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

// Создание новой категории
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

// Удаление категории
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Проверяем, есть ли заявки с этой категорией
    const requestsCount = await prisma.request.count({
      where: {
        id: categoryId,
      },
    });

    if (requestsCount > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить категорию, так как существуют связанные заявки' 
      });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ error: 'Ошибка при удалении категории' });
  }
});

module.exports = router;