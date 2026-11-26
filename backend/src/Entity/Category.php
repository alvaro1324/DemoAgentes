<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')]
class Category
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $name;

    public function __construct(string $name)
    {
        $this->rename($name);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function rename(string $name): void
    {
        $name = preg_replace('/^\s+|\s+$/u', '', $name) ?? '';
        if ($name === '' || mb_strlen($name, 'UTF-8') > 100) {
            throw new \InvalidArgumentException('El nombre de la categoría debe tener entre 1 y 100 caracteres.');
        }

        $this->name = $name;
    }
}
