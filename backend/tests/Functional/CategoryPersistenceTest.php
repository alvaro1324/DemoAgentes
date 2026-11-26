<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Category;
use App\Entity\Task;
use App\Repository\CategoryRepository;
use Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class CategoryPersistenceTest extends KernelTestCase
{
    private EntityManagerInterface $em;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);
        $path = $this->em->getConnection()->getParams()['path'] ?? '';
        self::assertStringEndsWith('tasks_test.db', $path, 'La limpieza solo se permite en la base de pruebas.');
        $metadata = [
            $this->em->getClassMetadata(Category::class),
            $this->em->getClassMetadata(Task::class),
        ];
        $schema = new SchemaTool($this->em);
        $schema->dropSchema($metadata);
        $schema->createSchema($metadata);
    }

    public function testAssociationAndRemovalSurviveReload(): void
    {
        $category = new Category('Trabajo');
        $task = new Task('Preparar demo');
        $task->assignCategory($category);
        $this->em->persist($category);
        $this->em->persist($task);
        $this->em->flush();
        $taskId = $task->getId();
        $categoryId = $category->getId();
        $this->em->clear();

        $reloaded = $this->em->find(Task::class, $taskId);
        self::assertInstanceOf(Task::class, $reloaded);
        self::assertSame($categoryId, $reloaded->getCategory()?->getId());
        self::assertSame('Trabajo', $reloaded->getCategory()?->getName());
        self::assertInstanceOf(CategoryRepository::class, $this->em->getRepository(Category::class));

        $reloaded->assignCategory(null);
        $this->em->flush();
        $category = $this->em->find(Category::class, $categoryId);
        self::assertInstanceOf(Category::class, $category);
        $this->em->remove($category);
        $this->em->flush();
        $this->em->clear();
        self::assertNull($this->em->find(Category::class, $categoryId));
        $remainingTask = $this->em->find(Task::class, $taskId);
        self::assertInstanceOf(Task::class, $remainingTask);
        self::assertNull($remainingTask->getCategory());
    }

    public function testDeletingReferencedCategoryIsRejected(): void
    {
        $category = new Category('Trabajo');
        $task = new Task('Preparar demo');
        $task->assignCategory($category);
        $this->em->persist($category);
        $this->em->persist($task);
        $this->em->flush();

        $this->expectException(ForeignKeyConstraintViolationException::class);
        $this->em->remove($category);
        $this->em->flush();
    }
}
