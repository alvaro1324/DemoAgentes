<?php

declare(strict_types=1);

namespace App\Http;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class TaskPayload
{
    public function __construct(private readonly ValidatorInterface $validator)
    {
    }

    /** @return array{title?: string, description?: ?string, isCompleted?: bool} */
    public function parse(Request $request, bool $creating): array
    {
        if ($request->getContentTypeFormat() !== 'json') {
            throw new ApiProblem('Utiliza Content-Type: application/json.', 'unsupported_media_type', 415);
        }
        try {
            $object = json_decode($request->getContent(), false, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new ApiProblem('El cuerpo debe ser JSON válido.', 'invalid_json');
        }
        if (!$object instanceof \stdClass) {
            throw new ApiProblem('El cuerpo debe ser un objeto JSON.');
        }
        $data = get_object_vars($object);
        $allowed = $creating ? ['title', 'description'] : ['title', 'description', 'isCompleted'];
        $errors = [];
        foreach (array_diff(array_keys($data), $allowed) as $field) {
            $errors[] = ['field' => (string) $field, 'message' => 'Este campo no está permitido.'];
        }
        if (!$creating && $data === []) {
            throw new ApiProblem('Envía al menos un campo para actualizar.');
        }
        $result = [];
        if ($creating || array_key_exists('title', $data)) {
            $title = $data['title'] ?? null;
            if (!is_string($title)) {
                $errors[] = ['field' => 'title', 'message' => 'El título debe ser un texto.'];
            } else {
                $title = preg_replace('/^\s+|\s+$/u', '', $title) ?? '';
                foreach ($this->validator->validate($title, [
                    new Assert\NotBlank(message: 'El título es obligatorio.'),
                    new Assert\Length(max: 200, maxMessage: 'El título admite hasta 200 caracteres.'),
                ]) as $violation) {
                    $errors[] = ['field' => 'title', 'message' => (string) $violation->getMessage()];
                }
                $result['title'] = $title;
            }
        }
        if (array_key_exists('description', $data)) {
            if ($data['description'] !== null && !is_string($data['description'])) {
                $errors[] = ['field' => 'description', 'message' => 'La descripción debe ser texto o null.'];
            } elseif (is_string($data['description']) && mb_strlen($data['description']) > 5000) {
                $errors[] = ['field' => 'description', 'message' => 'La descripción admite hasta 5.000 caracteres.'];
            } else {
                $result['description'] = $data['description'];
            }
        }
        if (!$creating && array_key_exists('isCompleted', $data)) {
            if (!is_bool($data['isCompleted'])) {
                $errors[] = ['field' => 'isCompleted', 'message' => 'El estado debe ser booleano.'];
            } else {
                $result['isCompleted'] = $data['isCompleted'];
            }
        }
        if ($errors !== []) {
            throw new ApiProblem('Revisa los datos de la tarea.', errors: $errors);
        }

        return $result;
    }
}
