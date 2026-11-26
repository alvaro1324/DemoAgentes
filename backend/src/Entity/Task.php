<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
#[ORM\Table(name: 'task')]
class Task
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    private string $title;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description;

    #[ORM\Column]
    private bool $isCompleted = false;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'RESTRICT')]
    private ?Category $category = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function __construct(string $title, ?string $description = null)
    {
        $this->title = self::validateTitle($title);
        $this->description = self::validateDescription($description);
        $this->createdAt = $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    }

    /** @param array{title?: string, description?: ?string, isCompleted?: bool} $changes */
    public function update(array $changes): void
    {
        $title = array_key_exists('title', $changes)
            ? self::validateTitle($changes['title'])
            : $this->title;
        $description = array_key_exists('description', $changes)
            ? self::validateDescription($changes['description'])
            : $this->description;

        $this->isCompleted = $changes['isCompleted'] ?? $this->isCompleted;
        $this->title = $title;
        $this->description = $description;
        $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    }

    private static function validateTitle(string $title): string
    {
        $title = preg_replace('/^\s+|\s+$/u', '', $title) ?? '';
        if ($title === '' || mb_strlen($title, 'UTF-8') > 200) {
            throw new \InvalidArgumentException('El título debe tener entre 1 y 200 caracteres.');
        }

        return $title;
    }

    private static function validateDescription(?string $description): ?string
    {
        if ($description !== null && mb_strlen($description, 'UTF-8') > 5000) {
            throw new \InvalidArgumentException('La descripción no puede superar los 5000 caracteres.');
        }

        return $description;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function assignCategory(?Category $category): void
    {
        $this->category = $category;
        $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    }

    /** @return array{id: ?int, title: string, description: ?string, isCompleted: bool, createdAt: string, updatedAt: string} */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'isCompleted' => $this->isCompleted,
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
