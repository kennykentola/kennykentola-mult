import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const SPRINTS_COLLECTION = 'team_sprints';
const TASKS_COLLECTION = 'team_tasks';
const PROJECTS_COLLECTION = 'agency_projects';

// Check if user is part of the project (Admin, PM, Developer, or Client for Read-Only)
async function verifyProjectAccess(projectId: string, userId: string, role?: string, requireWrite = false): Promise<boolean> {
  if (role === 'Admin' || role === 'Super Admin') return true;

  try {
    const project = await databases.getDocument(DATABASE_ID, PROJECTS_COLLECTION, projectId) as any;
    
    // Clients have read-only access
    if (project.clientId === userId && !requireWrite) return true;
    
    // PMs and Assigned Team have read/write access
    if (project.pmId === userId) return true;
    if (project.assignedTeam && project.assignedTeam.includes(userId)) return true;

    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Projects for Team Member
// ─────────────────────────────────────────────────────────────────────────────
router.get('/projects', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id!;
  const role = req.user?.role;

  try {
    let projectsData;
    
    if (role === 'Admin' || role === 'Super Admin') {
      // Admins see all projects
      projectsData = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION, [
        Query.orderDesc('$createdAt'), Query.limit(100)
      ]);
    } else {
      // Fetch all projects (pagination needed in real prod, fine for now)
      // and filter where pmId == userId OR assignedTeam includes userId
      const allProjects = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION, [
        Query.orderDesc('$createdAt'), Query.limit(200)
      ]);
      
      const filtered = allProjects.documents.filter((p: any) => 
        p.pmId === userId || (p.assignedTeam && p.assignedTeam.includes(userId))
      );
      
      projectsData = { documents: filtered };
    }

    res.status(200).json({ projects: projectsData.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Sprints for a Project
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sprints/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id!;
  const role = req.user?.role;

  if (!(await verifyProjectAccess(projectId, userId, role))) {
    return res.status(403).json({ error: 'Unauthorized access to project sprints' });
  }

  try {
    const sprints = await databases.listDocuments(
      DATABASE_ID,
      SPRINTS_COLLECTION,
      [Query.equal('projectId', projectId), Query.orderAsc('startDate')]
    );
    res.status(200).json({ sprints: sprints.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Create a Sprint
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sprints', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId, title, startDate, endDate, status } = req.body;
  const userId = req.user?.id!;
  const role = req.user?.role;

  if (!(await verifyProjectAccess(projectId, userId, role, true))) {
    return res.status(403).json({ error: 'Unauthorized to create sprints' });
  }

  try {
    const sprint = await databases.createDocument(
      DATABASE_ID,
      SPRINTS_COLLECTION,
      ID.unique(),
      {
        projectId,
        title,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: status || 'active'
      }
    );
    res.status(201).json({ sprint });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Tasks for a Project
// ─────────────────────────────────────────────────────────────────────────────
router.get('/tasks/:projectId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id!;
  const role = req.user?.role;

  if (!(await verifyProjectAccess(projectId, userId, role))) {
    return res.status(403).json({ error: 'Unauthorized access to project tasks' });
  }

  try {
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_COLLECTION,
      [Query.equal('projectId', projectId), Query.orderDesc('$createdAt')]
    );
    res.status(200).json({ tasks: tasks.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Create a Task
// ─────────────────────────────────────────────────────────────────────────────
router.post('/tasks', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { projectId, sprintId, title, description, assigneeId, priority, storyPoints } = req.body;
  const userId = req.user?.id!;
  const role = req.user?.role;

  if (!(await verifyProjectAccess(projectId, userId, role, true))) {
    return res.status(403).json({ error: 'Unauthorized to create tasks' });
  }

  try {
    const payload: any = {
      projectId,
      title,
      status: 'todo',
      priority: priority || 'medium',
      storyPoints: storyPoints ? Number(storyPoints) : 0
    };

    if (sprintId) payload.sprintId = sprintId;
    if (description) payload.description = description;
    if (assigneeId) payload.assigneeId = assigneeId;

    const task = await databases.createDocument(
      DATABASE_ID,
      TASKS_COLLECTION,
      ID.unique(),
      payload
    );
    res.status(201).json({ task });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Update a Task (Kanban Drag and Drop)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/tasks/:taskId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { taskId } = req.params;
  const { status, sprintId, assigneeId, priority, storyPoints } = req.body;
  const userId = req.user?.id!;
  const role = req.user?.role;

  try {
    // First fetch the task to get the projectId for auth check
    const task = await databases.getDocument(DATABASE_ID, TASKS_COLLECTION, taskId) as any;
    
    if (!(await verifyProjectAccess(task.projectId, userId, role, true))) {
      return res.status(403).json({ error: 'Unauthorized to update task' });
    }

    const payload: any = {};
    if (status) payload.status = status;
    if (sprintId !== undefined) payload.sprintId = sprintId; // can be null to move to backlog
    if (assigneeId !== undefined) payload.assigneeId = assigneeId;
    if (priority) payload.priority = priority;
    if (storyPoints !== undefined) payload.storyPoints = Number(storyPoints);

    const updatedTask = await databases.updateDocument(
      DATABASE_ID,
      TASKS_COLLECTION,
      taskId,
      payload
    );
    res.status(200).json({ task: updatedTask });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export const teamRouter = router;
