<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Entity\Category;
use App\Entity\Task;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class TaskTest extends TestCase
{
    public function testCategoryCanBeAssignedReplacedAndRemovedWithoutChangingContent(): void
    {
        $task = new Task('Preparar demo', 'Notas');
        $task->update(['isCompleted' => true]);
        $original = $task->toArray();
        self::assertNull($task->getCategory());

        foreach ([new Category('Trabajo'), new Category('Personal'), null] as $category) {
            $task->assignCategory($category);
            self::assertSame($category, $task->getCategory());
            $current = $task->toArray();
            self::assertGreaterThanOrEqual($original['updatedAt'], $current['updatedAt']);
            unset($original['updatedAt'], $current['updatedAt']);
            self::assertSame($original, $current);
            $original = $task->toArray();
        }
    }

    public function testCategoryCanBeSharedAndRenamedWithoutLosingAssociation(): void
    {
        $category = new Category('Trabajo');
        $first = new Task('Primera');
        $second = new Task('Segunda');
        $first->assignCategory($category);
        $second->assignCategory($category);
        $category->rename('Oficina');
        self::assertSame($category, $first->getCategory());
        self::assertSame($category, $second->getCategory());
        self::assertSame('Oficina', $first->getCategory()->getName());
    }

    /** @return iterable<string, array{string}> */
    public static function invalidTitles(): iterable
    {
        yield 'empty' => [''];
        yield 'whitespace' => [" \t\n "];
        yield 'unicode whitespace' => ["\u{00A0}\u{2003}"];
        yield 'over limit' => [str_repeat('a', 201)];
        yield 'unicode over limit' => [str_repeat('á', 201)];
    }

    #[DataProvider('invalidTitles')]
    public function testCreationRejectsInvalidTitle(string $title): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Task($title);
    }

    #[DataProvider('invalidTitles')]
    public function testInvalidTitleLeavesTaskUnchanged(string $title): void
    {
        $task = new Task('Original', 'Notas');
        $original = $task->toArray();

        try {
            $task->update(['title' => $title, 'description' => 'Cambio', 'isCompleted' => true]);
            self::fail('Se esperaba rechazar el título inválido.');
        } catch (\InvalidArgumentException) {
            self::assertSame($original, $task->toArray());
        }
    }

    public function testCreationRejectsDescriptionOverLimit(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Task('Título', str_repeat('á', 5001));
    }

    public function testInvalidDescriptionLeavesTaskUnchanged(): void
    {
        $task = new Task('Original', 'Notas');
        $original = $task->toArray();

        try {
            $task->update(['title' => 'Cambio', 'description' => str_repeat('á', 5001), 'isCompleted' => true]);
            self::fail('Se esperaba rechazar la descripción inválida.');
        } catch (\InvalidArgumentException) {
            self::assertSame($original, $task->toArray());
        }
    }

    public function testCharacterLimitsAcceptUnicodeAtCreationAndUpdate(): void
    {
        $title = str_repeat('á', 200);
        $description = str_repeat('ñ', 5000);
        $task = new Task($title, $description);
        self::assertSame($title, $task->toArray()['title']);
        self::assertSame($description, $task->toArray()['description']);

        $task->update(['title' => str_repeat('é', 200), 'description' => str_repeat('ó', 5000)]);
        self::assertSame(str_repeat('é', 200), $task->toArray()['title']);
        self::assertSame(str_repeat('ó', 5000), $task->toArray()['description']);
    }

    public function testTitleIsTrimmedAndPartialUpdatePreservesDescription(): void
    {
        $task = new Task("\u{00A0} Original \u{2003}", 'Notas');
        self::assertSame('Original', $task->toArray()['title']);

        $task->update(['title' => "\t Cambio \n"]);
        self::assertSame('Cambio', $task->toArray()['title']);
        self::assertSame('Notas', $task->toArray()['description']);
    }

    public function testDescriptionIsOptionalAndCanBeCleared(): void
    {
        $task = new Task('Título');
        self::assertNull($task->toArray()['description']);
        $task->update(['description' => 'Notas']);
        self::assertSame('Notas', $task->toArray()['description']);
        $task->update(['description' => null]);
        self::assertNull($task->toArray()['description']);
    }

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
