import { db } from './db';
import { summarizeCategoryUsage, validateCategory } from '../domain/categories';

export class CategoryDataError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CategoryDataError';
    this.code = code;
    this.details = details;
  }
}

async function readUsage(categoryId, database) {
  const [transactions, budgets, recurrences] = await Promise.all([
    database.transactions.where('categoryId').equals(categoryId).toArray(),
    database.budgets.where('categoryId').equals(categoryId).toArray(),
    database.recurrences.filter((item) => item.categoryId === categoryId).toArray(),
  ]);
  return summarizeCategoryUsage(categoryId, { transactions, budgets, recurrences });
}

function cleanCategory(data) {
  return { name: data.name.trim(), type: data.type, color: data.color };
}

function assertValid(data, categories, currentId = null) {
  const details = validateCategory(data, categories, currentId);
  if (Object.keys(details).length) {
    throw new CategoryDataError('CATEGORY_INVALID', 'Categoria inválida.', details);
  }
}

export async function categoryUsageOf(categoryId, { database = db } = {}) {
  return database.transaction(
    'r',
    database.transactions,
    database.budgets,
    database.recurrences,
    () => readUsage(categoryId, database),
  );
}

export async function addCategory(data, { database = db } = {}) {
  return database.transaction('rw', database.categories, async () => {
    const categories = await database.categories.toArray();
    assertValid(data, categories);
    return database.categories.add(cleanCategory(data));
  });
}

export async function updateCategory(id, data, { database = db } = {}) {
  return database.transaction(
    'rw',
    database.categories,
    database.transactions,
    database.budgets,
    database.recurrences,
    async () => {
      const current = await database.categories.get(id);
      if (!current) throw new CategoryDataError('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');

      const categories = await database.categories.toArray();
      assertValid(data, categories, id);

      if (current.type !== data.type) {
        const usage = await readUsage(id, database);
        if (usage.total > 0) {
          throw new CategoryDataError('CATEGORY_TYPE_IN_USE', 'O tipo não pode mudar enquanto a categoria estiver em uso.', usage);
        }
      }

      await database.categories.update(id, cleanCategory(data));
    },
  );
}

export async function deleteCategory(id, { database = db } = {}) {
  return database.transaction(
    'rw',
    database.categories,
    database.transactions,
    database.budgets,
    database.recurrences,
    async () => {
      const current = await database.categories.get(id);
      if (!current) throw new CategoryDataError('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');

      const usage = await readUsage(id, database);
      if (usage.total > 0) {
        throw new CategoryDataError('CATEGORY_IN_USE', 'A categoria ainda está em uso.', usage);
      }
      await database.categories.delete(id);
    },
  );
}
