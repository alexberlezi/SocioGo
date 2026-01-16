const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/categories - List all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
    try {
        const { name, color, type } = req.body;
        if (!name || !color || !type) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        const category = await prisma.category.create({
            data: { name, color, type }
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, type } = req.body;
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, color, type }
        });
        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check for dependencies in CashFlowEntry
        const hasEntries = await prisma.cashFlowEntry.findFirst({
            where: { categoryId: parseInt(id) }
        });

        if (hasEntries) {
            return res.status(400).json({ error: 'Não é possível excluir uma categoria que possui lançamentos vinculados.' });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
});

module.exports = router;
