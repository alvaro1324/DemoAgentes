<?php

declare(strict_types=1);

namespace App\Http;

final class ApiProblem extends \RuntimeException
{
    /** @param list<array{field: string, message: string}> $errors */
    public function __construct(
        string $message,
        public readonly string $problemCode = 'validation_error',
        public readonly int $status = 400,
        public readonly array $errors = [],
    ) {
        parent::__construct($message);
    }
}
