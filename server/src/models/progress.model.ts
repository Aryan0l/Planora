import pool from '../config/db';

let usesArrayProgressTable: boolean | null = null;

const hasCompletedTaskIdsArray = async () => {
  if (usesArrayProgressTable !== null) {
    return usesArrayProgressTable;
  }

  const result = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_name = 'progress' AND column_name = 'completed_task_ids'`,
  );

  usesArrayProgressTable = result.rows.length > 0;
  return usesArrayProgressTable;
};

export const getCompletedTaskIds = async (userId: number, planId: number) => {
  if (await hasCompletedTaskIdsArray()) {
    const result = await pool.query(
      `SELECT completed_task_ids
       FROM progress
       WHERE user_id = $1 AND plan_id = $2`,
      [userId, planId],
    );

    return result.rows[0]?.completed_task_ids || [];
  }

  const result = await pool.query(
    `SELECT task_id FROM progress WHERE user_id = $1 AND plan_id = $2 AND completed = true`,
    [userId, planId],
  );
  return result.rows.map((row: { task_id: number }) => row.task_id);
};

export const deleteProgressForPlan = async (userId: number, planId: number) => {
  await pool.query('DELETE FROM progress WHERE user_id = $1 AND plan_id = $2', [userId, planId]);
};

export const insertProgress = async (userId: number, planId: number, taskIds: number[]) => {
  if (!taskIds.length) {
    return;
  }

  if (await hasCompletedTaskIdsArray()) {
    await pool.query(
      `INSERT INTO progress (user_id, plan_id, completed_task_ids, updated_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, planId, taskIds],
    );
    return;
  }

  const inserts: string[] = [];
  const values: number[] = [userId, planId];
  taskIds.forEach((taskId, index) => {
    inserts.push(`($1, $2, $${index + 3}, true)`);
    values.push(taskId);
  });

  await pool.query(
    `INSERT INTO progress (user_id, plan_id, task_id, completed)
     VALUES ${inserts.join(', ')}
     ON CONFLICT (user_id, plan_id, task_id) DO UPDATE SET completed = EXCLUDED.completed`,
    values,
  );
};

export const countCompletedTasks = async (userId: number, planId: number) => {
  if (await hasCompletedTaskIdsArray()) {
    const result = await pool.query(
      `SELECT COALESCE(array_length(completed_task_ids, 1), 0) AS count
       FROM progress
       WHERE user_id = $1 AND plan_id = $2`,
      [userId, planId],
    );
    return Number(result.rows[0]?.count || 0);
  }

  const result = await pool.query(
    'SELECT COUNT(*) FROM progress WHERE user_id = $1 AND plan_id = $2 AND completed = true',
    [userId, planId],
  );
  return Number(result.rows[0]?.count || 0);
};
