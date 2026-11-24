<?php

declare(strict_types=1);

namespace App\Http;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

#[AsEventListener(event: 'kernel.exception', priority: 10)]
final class ApiExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        if ($exception instanceof ApiProblem) {
            $event->setResponse(new JsonResponse([
                'code' => $exception->problemCode,
                'message' => $exception->getMessage(),
                'errors' => $exception->errors,
            ], $exception->status));

            return;
        }

        $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
        if ($status >= 500) {
            error_log((string) $exception);
        }
        $event->setResponse(new JsonResponse([
            'code' => $status === 404 ? 'not_found' : 'http_error',
            'message' => match ($status) {
                404 => 'No se ha encontrado el recurso.',
                405 => 'Método no permitido.',
                default => $status >= 500 ? 'No se ha podido completar la operación.' : 'La petición no es válida.',
            },
            'errors' => [],
        ], $status, $exception instanceof HttpExceptionInterface ? $exception->getHeaders() : []));
    }
}
