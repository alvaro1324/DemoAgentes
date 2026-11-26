<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Entity\Category;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class CategoryTest extends TestCase
{
    /** @return iterable<string, array{string}> */
    public static function invalidNames(): iterable
    {
        yield 'empty' => [''];
        yield 'whitespace' => [" \t\n "];
        yield 'unicode whitespace' => ["\u{00A0}\u{2003}"];
        yield 'over limit' => [str_repeat('a', 101)];
        yield 'unicode over limit' => [str_repeat('á', 101)];
    }

    #[DataProvider('invalidNames')]
    public function testCreationRejectsInvalidName(string $name): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Category($name);
    }

    #[DataProvider('invalidNames')]
    public function testInvalidRenamePreservesName(string $name): void
    {
        $category = new Category('Trabajo');

        try {
            $category->rename($name);
            self::fail('Se esperaba rechazar el nombre inválido.');
        } catch (\InvalidArgumentException) {
            self::assertSame('Trabajo', $category->getName());
        }
    }

    public function testNameIsTrimmedAndUnicodeLimitIsAccepted(): void
    {
        $category = new Category("\u{00A0} Trabajo \u{2003}");
        self::assertNull($category->getId());
        self::assertSame('Trabajo', $category->getName());
        $category->rename(str_repeat('á', 100));
        self::assertSame(str_repeat('á', 100), $category->getName());
        self::assertSame(str_repeat('ñ', 100), (new Category(str_repeat('ñ', 100)))->getName());
    }
}
