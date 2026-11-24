<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Entity\Task;
use PHPUnit\Framework\TestCase;

final class TaskTest extends TestCase
{
    public function testReopeningPreservesContentAndCreationDate(): void
    {
        $task = new Task('Revisar demo', 'Notas');
        $original = $task->toArray();
        $task->update(['isCompleted' => true]);
        self::assertTrue($task->toArray()['isCompleted']);
        $task->update(['isCompleted' => false]);
        $reopened = $task->toArray();
        self::assertFalse($reopened['isCompleted']);
        self::assertSame($original['title'], $reopened['title']);
        self::assertSame($original['description'], $reopened['description']);
        self::assertSame($original['createdAt'], $reopened['createdAt']);
    }
}
