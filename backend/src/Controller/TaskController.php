<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Task;
use App\Http\ApiProblem;
use App\Http\TaskPayload;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/tasks', name: 'tasks_')]
final class TaskController extends AbstractController
{
    public function __construct(
        private readonly TaskRepository $tasks,
        private readonly EntityManagerInterface $entityManager,
        private readonly TaskPayload $payload,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filter = $request->query->get('completed');
        if ($filter !== null && !in_array($filter, ['true', 'false'], true)) {
            throw new ApiProblem('El filtro completed debe ser true o false.');
        }

        return $this->json(array_map(
            static fn (Task $task): array => $task->toArray(),
            $this->tasks->matchingStatus($filter === null ? null : $filter === 'true'),
        ));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = $this->payload->parse($request, true);
        $task = new Task($data['title'] ?? '', $data['description'] ?? null);
        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json($task->toArray(), 201, ['Location' => $this->generateUrl('tasks_detail', ['id' => $task->getId()])]);
    }

    #[Route('/{id}', name: 'detail', requirements: ['id' => '[1-9]\d*'], methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        return $this->json($this->find($id)->toArray());
    }

    #[Route('/{id}', name: 'update', requirements: ['id' => '[1-9]\d*'], methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->find($id);
        $task->update($this->payload->parse($request, false));
        $this->entityManager->flush();

        return $this->json($task->toArray());
    }

    #[Route('/{id}', name: 'delete', requirements: ['id' => '[1-9]\d*'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->entityManager->remove($this->find($id));
        $this->entityManager->flush();

        return new JsonResponse(null, 204);
    }

    private function find(int $id): Task
    {
        return $this->tasks->find($id) ?? throw new ApiProblem('La tarea no existe.', 'not_found', 404);
    }
}
